import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: Request) => {
    // 0. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    try {
        const payload = await req.json()
        console.log("Payload reçu:", JSON.stringify(payload, null, 2))

        const record = payload.record || payload
        const old_record = payload.old_record
        const type = payload.type || 'INSERT'

        if (!record || !record.user_id) {
            console.error("Payload invalide: record.user_id manquant")
            return new Response(JSON.stringify({ error: "record.user_id manquant" }), { status: 400 })
        }

        // Si l'event a déjà été créé et qu'il s'agit d'une mise à jour de la boucle de webhook, ignorer
        if (type === 'UPDATE' && record.calendar_event_created && !old_record?.calendar_event_created) {
            return new Response(JSON.stringify({ status: 'skipped', message: 'Webhook loop prevented' }))
        }

        // 1. Initialiser Supabase Admin
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Variables d'environnement Supabase manquantes")
        }
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 2. Récupérer les tokens de l'utilisateur
        const { data: tokenData, error: tokenError } = await supabaseAdmin
            .from('google_calendar_tokens')
            .select('*')
            .eq('user_id', record.user_id)
            .single()

        if (tokenError || !tokenData) {
            console.log(`Aucun token Google trouvé pour l'utilisateur ${record.user_id}.`);
            return new Response(JSON.stringify({
                status: 'skipped',
                message: 'Le calendrier Google de cet utilisateur n\'est pas connecté.'
            }), { headers: { "Content-Type": "application/json" } })
        }

        // 3. Rafraîchir le token si nécessaire
        let accessToken = tokenData.access_token
        const isExpired = tokenData.expires_at && new Date(tokenData.expires_at) < new Date()

        if (isExpired && tokenData.refresh_token) {
            console.log("Token expiré, tentative de rafraîchissement...");
            if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
                throw new Error("Variables d'environnement Google Client ID/Secret manquantes")
            }

            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    refresh_token: tokenData.refresh_token,
                    grant_type: 'refresh_token',
                }),
            })

            const refreshData = await refreshResponse.json()

            if (refreshData.error) {
                console.error("Erreur rafraîchissement token:", refreshData.error)
                throw new Error(`Google Refresh Token Error: ${refreshData.error_description || refreshData.error}`)
            }

            accessToken = refreshData.access_token
            let expiresIn = Number(refreshData.expires_in)
            if (isNaN(expiresIn)) expiresIn = 3600

            const expiresDate = new Date(Date.now() + expiresIn * 1000)
            if (isNaN(expiresDate.getTime())) {
                throw new Error("Date d'expiration invalide calculée après rafraîchissement")
            }
            const newExpiresAt = expiresDate.toISOString()

            // Update tokens in DB
            await supabaseAdmin
                .from('google_calendar_tokens')
                .update({
                    access_token: accessToken,
                    expires_at: newExpiresAt,
                })
                .eq('user_id', record.user_id)

            console.log("Token rafraîchi avec succès.");
        }

        // 4. Gestion Annulation / Delete
        if (type === 'DELETE' || (type === 'UPDATE' && record.status === 'cancelled')) {
            const eventId = record.google_event_id || old_record?.google_event_id;
            if (eventId) {
                const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                console.log(`Événement ${eventId} supprimé de Google Calendar. Status:`, calRes.status);
            }
            return new Response(JSON.stringify({ status: 'ok', action: 'deleted' }), {
                headers: { "Content-Type": "application/json" },
            })
        }

        // 5. Gestion Reprogrammation / Update
        if (type === 'UPDATE') {
            const eventId = record.google_event_id;
            // Si reprogrammation (changement de date)
            if (eventId && old_record && record.scheduled_at !== old_record.scheduled_at) {
                const duration = Number(record.duration_minutes) || 30
                const startDate = new Date(record.scheduled_at)

                if (isNaN(startDate.getTime())) {
                    console.error("Date de début invalide (reprogrammation):", record.scheduled_at)
                    throw new Error(`Date de début invalide: ${record.scheduled_at}`)
                }

                const endDate = new Date(startDate.getTime() + duration * 60000)
                if (isNaN(endDate.getTime())) {
                    throw new Error("Date de fin invalide calculée (reprogrammation)")
                }

                const updatedEvent = {
                    start: { dateTime: startDate.toISOString() },
                    end: { dateTime: endDate.toISOString() }
                };
                const patchRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedEvent),
                });

                if (!patchRes.ok) {
                    const errData = await patchRes.json().catch(() => ({}));
                    console.error("Erreur Patch Google Calendar:", errData)
                    throw new Error(`Erreur Google Calendar Patch: ${JSON.stringify(errData.error || errData)}`)
                }

                console.log(`Événement ${eventId} reprogrammé dans Google Calendar.`);
                return new Response(JSON.stringify({ status: 'ok', action: 'rescheduled' }), {
                    headers: { "Content-Type": "application/json" },
                })
            }
            // S'il n'y a pas eu de changement pertinent
            return new Response(JSON.stringify({ status: 'ok', action: 'ignored' }), {
                headers: { "Content-Type": "application/json" },
            })
        }

        // 6. Création de l'événement Calendar (Cas par défaut : INSERT)
        if (!record.scheduled_at) {
            console.warn("Date de rendez-vous manquante (scheduled_at).");
            return new Response(JSON.stringify({ error: "scheduled_at manquant" }), { status: 400 })
        }

        const duration = Number(record.duration_minutes) || 30
        const startDate = new Date(record.scheduled_at)

        if (isNaN(startDate.getTime())) {
            console.error("Date de début invalide (création):", record.scheduled_at)
            throw new Error(`Date de début invalide: ${record.scheduled_at}`)
        }

        const endDate = new Date(startDate.getTime() + duration * 60000)
        if (isNaN(endDate.getTime())) {
            throw new Error("Date de fin invalide calculée (création)")
        }

        const event = {
            summary: `Pretalk.me: ${record.guest_name || 'Nouveau RDV'}`,
            description: `Rendez-vous via Pretalk.me\n\nNotes: ${record.notes || 'Aucune'}\nLieu: ${record.meeting_type}`,
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            conferenceData: {
                createRequest: {
                    requestId: `meet-${record.id}-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
            attendees: record.guest_email ? [
                { email: record.guest_email, displayName: record.guest_name }
            ] : [],
        }

        console.log("Tentative de création d'événement Google Calendar...");
        const calendarResponse = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        )

        const calendarData = await calendarResponse.json()

        if (!calendarResponse.ok) {
            console.error("Erreur création Google Calendar:", calendarData)
            throw new Error(`Erreur Google Calendar Creation: ${JSON.stringify(calendarData.error || calendarData)}`)
        }

        // 7. Mettre à jour le booking avec les infos Google
        const meetLink = calendarData.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                google_event_id: calendarData.id,
                google_meet_link: meetLink || null,
                calendar_event_created: true,
                status: 'confirmed'
            })
            .eq('id', record.id)

        if (updateError) {
            console.error("Erreur mise à jour booking:", updateError)
            // On ne throw pas ici car l'event calendar est créé, mais on log l'erreur
        }

        console.log(`Succès: Événement ${calendarData.id} créé.`);
        return new Response(JSON.stringify({ status: 'ok', event_id: calendarData.id }), {
            headers: { "Content-Type": "application/json" },
        })

    } catch (error) {
        console.error("🚨 Erreur Google Calendar Sync:", error)
        return new Response(JSON.stringify({ error: error.message || 'Erreur inconnue' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})

