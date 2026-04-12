-- Mettre à jour la contrainte de format d'annonce pour inclure le modèle 'bottom_right_card'
ALTER TABLE in_app_announcements DROP CONSTRAINT IF EXISTS in_app_announcements_layout_type_check;
ALTER TABLE in_app_announcements ADD CONSTRAINT in_app_announcements_layout_type_check CHECK (layout_type IN ('top_banner', 'split_modal', 'sidebar_card', 'bottom_right_card'));
