/**
 * DevisModal — create a proposal (devis) directly from a WA conversation.
 *
 * Creates:
 *  - a shared.engagement (discovery → proposed transition)
 *  - a shared.document  (type = 'proposal', status = 'draft')
 *
 * Only rendered when tenant.mode_freelance = true.
 */

import { useState } from 'react';
import { X, FileText, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';

interface DevisModalProps {
  conversationId: string;
  contactId: string;
  contactName: string;
  onClose: () => void;
}

const CURRENCIES = ['MAD', 'EUR', 'USD'];

export function DevisModal({ conversationId, contactId, contactName, onClose }: DevisModalProps) {
  const { tenantId } = useApp();
  const { api } = useApi();
  const [step, setStep] = useState<'form' | 'saving' | 'done'>('form');
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [actionLoading, setActionLoading] = useState<'pdf' | 'send' | null>(null);
  const [form, setForm] = useState({
    title: `Devis — ${contactName}`,
    description: '',
    amount: '',
    currency: 'MAD',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const IS_PROD = window.location.hostname.endsWith('pretalk.me');
  const CRM_BASE = IS_PROD ? 'https://pretalk.me/app' : 'http://localhost:5174';

  const handleSubmit = async () => {
    if (!tenantId) return;
    setStep('saving');
    setError(null);

    try {
      // 1. Find or get the shared contact for this WA contact
      const { data: sharedContacts } = await (supabase as any)
        .schema('shared')
        .from('contacts')
        .select('id')
        .eq('wa_contact_id', contactId)
        .limit(1);

      const sharedContactId = sharedContacts?.[0]?.id ?? null;

      // 2. Create (or find) a shared.engagement for this conversation
      const { data: existingEng } = await (supabase as any)
        .schema('shared')
        .from('engagements')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('source_id', conversationId)
        .limit(1);

      let engagementId: string;
      if (existingEng?.[0]?.id) {
        engagementId = existingEng[0].id;
        // Advance to proposed
        await (supabase as any)
          .schema('shared')
          .from('engagements')
          .update({ status: 'proposed', proposed_at: new Date().toISOString(), amount: form.amount ? parseFloat(form.amount) : null, currency: form.currency })
          .eq('id', engagementId);
      } else {
        const { data: newEng, error: engErr } = await (supabase as any)
          .schema('shared')
          .from('engagements')
          .insert({
            tenant_id: tenantId,
            contact_id: sharedContactId,
            source_app: 'whatsapp',
            source_id: conversationId,
            status: 'proposed',
            title: form.title,
            description: form.description || null,
            amount: form.amount ? parseFloat(form.amount) : null,
            currency: form.currency,
            proposed_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (engErr) throw engErr;
        engagementId = newEng.id;
      }

      // 3. Generate a reference number
      const ref = `DEVIS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      // 4. Create shared.document
      const { data: doc, error: docErr } = await (supabase as any)
        .schema('shared')
        .from('documents')
        .insert({
          tenant_id: tenantId,
          engagement_id: engagementId,
          contact_id: sharedContactId,
          type: 'proposal',
          status: 'draft',
          title: form.title,
          reference: ref,
          amount: form.amount ? parseFloat(form.amount) : null,
          currency: form.currency,
          created_by_app: 'whatsapp',
        })
        .select('id')
        .single();
      if (docErr) throw docErr;

      // 5. Post an internal note in the conversation
      await supabase.from('messages').insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        type: 'note',
        content: `📄 Devis créé : ${form.title} — ${form.amount ? `${parseFloat(form.amount).toLocaleString('fr-MA')} ${form.currency}` : 'montant non défini'} (${ref})`,
      });

      setCreatedDocId(doc.id);
      setPdfReady(false);
      setStep('done');
    } catch (err: any) {
      console.error('DevisModal: create failed', err);
      setError(err?.message || 'Une erreur est survenue.');
      setStep('form');
    }
  };

  const handleGeneratePdf = async () => {
    if (!createdDocId) return;
    setActionLoading('pdf');
    setError(null);
    try {
      await api.post(`/api/v1/proposals/${createdDocId}/generate-pdf`);
      setPdfReady(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Generation PDF impossible.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!createdDocId) return;
    setActionLoading('send');
    setError(null);
    try {
      if (!pdfReady) {
        await api.post(`/api/v1/proposals/${createdDocId}/generate-pdf`);
        setPdfReady(true);
      }
      await api.post(`/api/v1/proposals/${createdDocId}/send-whatsapp`);
      setError('Devis envoye sur WhatsApp.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Envoi WhatsApp impossible.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-[#00A884]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#111B21]">Créer un Devis</h2>
              <p className="text-[12px] text-[#54656F]">{contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F2F5] rounded-lg transition-colors">
            <X size={18} className="text-[#8696A0]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 'done' ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-[#00A884]" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#111B21]">Devis créé !</p>
                <p className="text-[13px] text-[#54656F] mt-1">
                  Le dossier est visible dans <strong>Dossiers de Service</strong> et dans la plateforme Consultant.
                </p>
              </div>
              {error && (
                <p className={`text-[13px] border rounded-lg px-3 py-2 ${error.includes('envoye') ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleGeneratePdf}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#111B21] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1F2937] transition-colors disabled:opacity-60"
                >
                  {actionLoading === 'pdf' ? <><Loader2 size={15} className="animate-spin" /> Génération PDF…</> : (pdfReady ? 'PDF prêt' : 'Générer PDF')}
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#00A884] text-white rounded-xl text-[14px] font-semibold hover:bg-[#008069] transition-colors disabled:opacity-60"
                >
                  {actionLoading === 'send' ? <><Loader2 size={15} className="animate-spin" /> Envoi WhatsApp…</> : 'Envoyer sur WhatsApp'}
                </button>
                <a
                  href={`${CRM_BASE}/documents/${createdDocId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#00A884] text-white rounded-xl text-[14px] font-semibold hover:bg-[#008069] transition-colors"
                >
                  <ExternalLink size={15} />
                  Ouvrir dans Consultant
                </a>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 bg-[#F0F2F5] text-[#111B21] rounded-xl text-[14px] font-medium hover:bg-[#E9EDEF] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Title */}
              <div>
                <label className="text-[12px] font-semibold text-[#54656F] mb-1 block">Titre du devis *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#D1D7DB] rounded-xl text-[14px] focus:outline-none focus:border-[#00A884]/60 bg-[#F9FAFB]"
                  placeholder="Ex: Développement site e-commerce"
                />
              </div>

              {/* Amount + Currency */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[12px] font-semibold text-[#54656F] mb-1 block">Montant</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#D1D7DB] rounded-xl text-[14px] focus:outline-none focus:border-[#00A884]/60 bg-[#F9FAFB]"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#54656F] mb-1 block">Devise</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="px-3 py-2.5 border border-[#D1D7DB] rounded-xl text-[14px] focus:outline-none focus:border-[#00A884]/60 bg-[#F9FAFB] h-11"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[12px] font-semibold text-[#54656F] mb-1 block">Description (optionnel)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-[#D1D7DB] rounded-xl text-[14px] focus:outline-none focus:border-[#00A884]/60 bg-[#F9FAFB] resize-none"
                  placeholder="Détails de la prestation…"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#F0F2F5] text-[#111B21] rounded-xl text-[14px] font-medium hover:bg-[#E9EDEF] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim() || step === 'saving'}
              className="flex-1 px-4 py-2.5 bg-[#00A884] text-white rounded-xl text-[14px] font-semibold hover:bg-[#008069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === 'saving' ? (
                <><Loader2 size={15} className="animate-spin" /> Création…</>
              ) : (
                <><FileText size={15} /> Créer le devis</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
