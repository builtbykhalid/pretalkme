-- ==============================================================================
-- ⚡ AUDIT CORRECTIVE DE PERFORMANCE GLOBAL - SUPABASE ADVISOR
-- Consolidation Finale, Optimisation Cache RLS et Nettoyage des Doublons
-- Version: 5.6 (Fixed Column Names & Role Optimization)
-- ==============================================================================

-- 1. PROFILES
DROP POLICY IF EXISTS "Profiles_Owner_Insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Owner_Update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Owner_Delete" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Public_Read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles_Owner_Manage" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Profiles_Owner_Insert" ON public.profiles FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Profiles_Owner_Update" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));
CREATE POLICY "Profiles_Owner_Delete" ON public.profiles FOR DELETE USING (id = (SELECT auth.uid()));
CREATE POLICY "Profiles_Public_Read" ON public.profiles FOR SELECT USING (true);


-- 2. FORMS
DROP POLICY IF EXISTS "Forms_Owner_Insert" ON public.forms;
DROP POLICY IF EXISTS "Forms_Owner_Update" ON public.forms;
DROP POLICY IF EXISTS "Forms_Owner_Delete" ON public.forms;
DROP POLICY IF EXISTS "Forms_Public_Read" ON public.forms;
DROP POLICY IF EXISTS "Forms_Owner_Manage" ON public.forms;
DROP POLICY IF EXISTS "Admins have full access to forms" ON public.forms;
DROP POLICY IF EXISTS "Users can CRUD own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can manage their own forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view form booking config" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
DROP POLICY IF EXISTS "Public can view published forms" ON public.forms;

CREATE POLICY "Forms_Owner_Insert" ON public.forms FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Forms_Owner_Update" ON public.forms FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Forms_Owner_Delete" ON public.forms FOR DELETE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Forms_Public_Read" ON public.forms FOR SELECT USING (true);


-- 3. LEADS
DROP POLICY IF EXISTS "Leads_Owner_Select" ON public.leads;
DROP POLICY IF EXISTS "Leads_Owner_Update" ON public.leads;
DROP POLICY IF EXISTS "Leads_Owner_Delete" ON public.leads;
DROP POLICY IF EXISTS "Leads_Owner_Manage" ON public.leads;
DROP POLICY IF EXISTS "Leads_Public_Insert" ON public.leads;
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
DROP POLICY IF EXISTS "Users can CRUD own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their own forms" ON public.leads;
DROP POLICY IF EXISTS "Public can view own lead" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads into active forms" ON public.leads;

CREATE POLICY "Leads_Owner_Select" ON public.leads FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Leads_Owner_Update" ON public.leads FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Leads_Owner_Delete" ON public.leads FOR DELETE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Leads_Public_Insert" ON public.leads FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.forms 
        WHERE forms.id = leads.form_id 
        AND forms.status IN ('published', 'Active', 'published_v1')
    )
);


-- 4. BOOKINGS
DROP POLICY IF EXISTS "Bookings_Owner_Select" ON public.bookings;
DROP POLICY IF EXISTS "Bookings_Owner_Update" ON public.bookings;
DROP POLICY IF EXISTS "Bookings_Owner_Delete" ON public.bookings;
DROP POLICY IF EXISTS "Bookings_Owner_Manage" ON public.bookings;
DROP POLICY IF EXISTS "Bookings_Public_Insert" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert bookings for their forms" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings for published forms" ON public.bookings;

CREATE POLICY "Bookings_Owner_Select" ON public.bookings FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Bookings_Owner_Update" ON public.bookings FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Bookings_Owner_Delete" ON public.bookings FOR DELETE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Bookings_Public_Insert" ON public.bookings FOR INSERT WITH CHECK (
    form_id IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.forms 
        WHERE forms.id = bookings.form_id 
        AND forms.status IN ('published', 'Active', 'published_v1')
    )
);


-- 5. DEALS & SERVICES
DROP POLICY IF EXISTS "Deals_Owner_Manage" ON public.deals;
DROP POLICY IF EXISTS "Consultants can manage their own deals" ON public.deals;
CREATE POLICY "Deals_Owner_Manage" ON public.deals FOR ALL USING (consultant_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Services_Owner_Insert" ON public.services;
DROP POLICY IF EXISTS "Services_Owner_Update" ON public.services;
DROP POLICY IF EXISTS "Services_Owner_Delete" ON public.services;
DROP POLICY IF EXISTS "Services_Public_Read" ON public.services;
DROP POLICY IF EXISTS "Consultants can manage their own services" ON public.services;
DROP POLICY IF EXISTS "Public can view active services" ON public.services;

CREATE POLICY "Services_Owner_Insert" ON public.services FOR INSERT WITH CHECK (consultant_id = (SELECT auth.uid()));
CREATE POLICY "Services_Owner_Update" ON public.services FOR UPDATE USING (consultant_id = (SELECT auth.uid()));
CREATE POLICY "Services_Owner_Delete" ON public.services FOR DELETE USING (consultant_id = (SELECT auth.uid()));
CREATE POLICY "Services_Public_Read" ON public.services FOR SELECT USING (true);


-- 6. NOTIFICATIONS
DROP POLICY IF EXISTS "Notifications_Owner_Manage" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Notifications_Owner_Manage" ON public.notifications FOR ALL USING (user_id = (SELECT auth.uid()));


-- 7. AUTOMATION & WORKFLOWS
DROP POLICY IF EXISTS "Workflows_Owner_Manage" ON public.workflows;
DROP POLICY IF EXISTS "Users can manage own workflows" ON public.workflows;
CREATE POLICY "Workflows_Owner_Manage" ON public.workflows FOR ALL USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "automation_logs_Owner_Read" ON public.automation_logs;
DROP POLICY IF EXISTS "Users can view their own automation logs" ON public.automation_logs;
CREATE POLICY "automation_logs_Owner_Read" ON public.automation_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.workflows 
        WHERE workflows.id = automation_logs.workflow_id 
        AND workflows.user_id = (SELECT auth.uid())
    )
);


-- 8. TESTIMONIALS (Static table, optimize role check)
DROP POLICY IF EXISTS "Testimonials_Admin_Manage" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials_Public_Read" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access to active testimonials" ON public.testimonials;

CREATE POLICY "Testimonials_Admin_Manage" ON public.testimonials FOR ALL 
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Testimonials_Public_Read" ON public.testimonials FOR SELECT USING (true);


-- 9. WAITLIST (Public access, no owner column)
DROP POLICY IF EXISTS "Waitlist_Admin_Select" ON public.waitlist;
DROP POLICY IF EXISTS "Waitlist_Admin_Update" ON public.waitlist;
DROP POLICY IF EXISTS "Waitlist_Admin_Delete" ON public.waitlist;
DROP POLICY IF EXISTS "Waitlist_Public_Insert" ON public.waitlist;
DROP POLICY IF EXISTS "allow_admin_all" ON public.waitlist;
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.waitlist;
DROP POLICY IF EXISTS "Allow insert for anyone" ON public.waitlist;

CREATE POLICY "Waitlist_Admin_Select" ON public.waitlist FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
CREATE POLICY "Waitlist_Admin_Update" ON public.waitlist FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
CREATE POLICY "Waitlist_Admin_Delete" ON public.waitlist FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
CREATE POLICY "Waitlist_Public_Insert" ON public.waitlist FOR INSERT WITH CHECK (email IS NOT NULL AND length(email) > 3);


-- 10. ANNOUNCEMENTS
DROP POLICY IF EXISTS "Announcements_Admin_Manage" ON public.in_app_announcements;
DROP POLICY IF EXISTS "Announcements_Public_Read" ON public.in_app_announcements;
DROP POLICY IF EXISTS "Admins can manage in-app announcements" ON public.in_app_announcements;
DROP POLICY IF EXISTS "Anyone can read active in-app announcements" ON public.in_app_announcements;

CREATE POLICY "Announcements_Admin_Manage" ON public.in_app_announcements FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
CREATE POLICY "Announcements_Public_Read" ON public.in_app_announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dismissals_Owner_Manage" ON public.user_dismissed_announcements;
DROP POLICY IF EXISTS "Users can insert their own dismissals" ON public.user_dismissed_announcements;
DROP POLICY IF EXISTS "Users can read their own dismissals" ON public.user_dismissed_announcements;
CREATE POLICY "Dismissals_Owner_Manage" ON public.user_dismissed_announcements FOR ALL USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Events_Owner_Insert" ON public.announcement_events;
DROP POLICY IF EXISTS "Events_Admin_Manage" ON public.announcement_events;
DROP POLICY IF EXISTS "Admins can view all announcement events" ON public.announcement_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.announcement_events;
CREATE POLICY "Events_Owner_Insert" ON public.announcement_events FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Events_Admin_Manage" ON public.announcement_events FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));


-- 11. REMINDERS & INTEGRATIONS & PLATFORM SETTINGS
DROP POLICY IF EXISTS "Reminders_Owner_Manage" ON public.booking_reminders;
DROP POLICY IF EXISTS "System can manage reminders" ON public.booking_reminders;
CREATE POLICY "Reminders_Owner_Manage" ON public.booking_reminders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_reminders.booking_id
        AND b.user_id = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "User_Integrations_Owner_Manage" ON public.user_integrations;
DROP POLICY IF EXISTS "Users manage own integrations" ON public.user_integrations;
CREATE POLICY "User_Integrations_Owner_Manage" ON public.user_integrations FOR ALL USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Platform_Settings_Admin_Manage" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform_Settings_Public_Read" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Platform_Settings_Admin_Manage" ON public.platform_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
CREATE POLICY "Platform_Settings_Public_Read" ON public.platform_settings FOR SELECT USING (true);


-- 12. CLEANUP REPORTS & ANALYTICS
DROP POLICY IF EXISTS "Report_Templates_Public_Read" ON public.report_templates;
DROP POLICY IF EXISTS "Report_Templates_Admin_Manage" ON public.report_templates;
DROP POLICY IF EXISTS "select_templates_authenticated" ON public.report_templates;
DROP POLICY IF EXISTS "manage_templates_admins" ON public.report_templates;
CREATE POLICY "Report_Templates_Public_Read" ON public.report_templates FOR SELECT USING (true);
CREATE POLICY "Report_Templates_Admin_Manage" ON public.report_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'report_template_usage' AND schemaname = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Report_Usage_Owner_Manage" ON public.report_template_usage';
        EXECUTE 'DROP POLICY IF EXISTS "insert_usage_by_owner_or_admin" ON public.report_template_usage';
        EXECUTE 'DROP POLICY IF EXISTS "select_usage_admins" ON public.report_template_usage';
        EXECUTE 'CREATE POLICY "Report_Usage_Owner_Manage" ON public.report_template_usage FOR ALL USING (user_id = (SELECT auth.uid()))';
    END IF;
END $$;

-- Analytics: use DO block to detect correct column (profile_id vs user_id)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'public_analytics_events' AND schemaname = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Analytics_Owner_Read" ON public.public_analytics_events';
        EXECUTE 'DROP POLICY IF EXISTS "Consultants can view their own analytics" ON public.public_analytics_events';
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_analytics_events' AND column_name = 'profile_id') THEN
            EXECUTE 'CREATE POLICY "Analytics_Owner_Read" ON public.public_analytics_events FOR SELECT USING (profile_id = (SELECT auth.uid()))';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_analytics_events' AND column_name = 'user_id') THEN
            EXECUTE 'CREATE POLICY "Analytics_Owner_Read" ON public.public_analytics_events FOR SELECT USING (user_id = (SELECT auth.uid()))';
        END IF;
    END IF;
END $$;

-- ==============================================================================
-- FIN DE L'AUDIT PERFORMANCE GLOBAL (V5.6)
-- ==============================================================================
