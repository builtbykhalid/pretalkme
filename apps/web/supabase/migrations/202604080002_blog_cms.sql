-- ============================================
-- BLOG CMS — Articles, catégories, tags
-- ============================================

-- 1. Catégories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Articles
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);

-- 5. RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Lecture publique des articles publiés
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Admin full access aux articles
DROP POLICY IF EXISTS "Admins full access posts" ON blog_posts;
CREATE POLICY "Admins full access posts" ON blog_posts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Catégories : lecture publique, écriture admin
DROP POLICY IF EXISTS "Public read categories" ON blog_categories;
CREATE POLICY "Public read categories" ON blog_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON blog_categories;
CREATE POLICY "Admins manage categories" ON blog_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tags : lecture publique, écriture admin
DROP POLICY IF EXISTS "Public read tags" ON blog_tags;
CREATE POLICY "Public read tags" ON blog_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage tags" ON blog_tags;
CREATE POLICY "Admins manage tags" ON blog_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Public read post_tags" ON blog_post_tags;
CREATE POLICY "Public read post_tags" ON blog_post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage post_tags" ON blog_post_tags;
CREATE POLICY "Admins manage post_tags" ON blog_post_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Migrer les case studies existants
INSERT INTO blog_categories (name, slug, color, description) VALUES
  ('Conseil Stratégie', 'conseil-strategie', '#0D0D0D', 'Consultants et stratèges'),
  ('Solopreneur', 'solopreneur', '#16a34a', 'Freelances et indépendants'),
  ('Coaching', 'coaching', '#7c3aed', 'Coachs exécutifs et de vie'),
  ('Agence', 'agence', '#d97706', 'Agences digitales et marketing')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_tags (name, slug) VALUES
  ('Closing', 'closing'),
  ('Audit IA', 'audit-ia'),
  ('High-Ticket', 'high-ticket'),
  ('Solopreneur', 'solopreneur'),
  ('Stack', 'stack'),
  ('Productivité', 'productivite'),
  ('Coaching', 'coaching'),
  ('Formulaires IA', 'formulaires-ia'),
  ('Conversion', 'conversion'),
  ('Agence', 'agence'),
  ('Pipeline', 'pipeline'),
  ('MRR', 'mrr')
ON CONFLICT (slug) DO NOTHING;

-- Insérer les 4 case studies
WITH cats AS (
  SELECT id, slug FROM blog_categories
)
INSERT INTO blog_posts (title, slug, excerpt, cover_image_url, category_id, status, featured, read_time_minutes, published_at, content)
SELECT
  'Comment Thomas a multiplié son taux de closing par 3 en 60 jours',
  'thomas-3x-closing',
  'Consultant senior en stratégie, Thomas perdait 6h par semaine sur des prospects hors budget. Pretalk a transformé son processus de découverte.',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=500&fit=crop',
  c.id,
  'published',
  true,
  8,
  NOW() - INTERVAL '23 days',
  '<p class="intro">Thomas Renard est consultant en stratégie senior depuis 12 ans...</p><h2>Le problème : des calls de découverte chronophages</h2><p>Avant Pretalk, Thomas passait en moyenne 45 minutes à préparer chaque rendez-vous de découverte — et la moitié de ses prospects n''avaient tout simplement pas le budget.</p>'
FROM cats c WHERE c.slug = 'conseil-strategie'
ON CONFLICT (slug) DO NOTHING;

WITH cats AS (
  SELECT id, slug FROM blog_categories
)
INSERT INTO blog_posts (title, slug, excerpt, cover_image_url, category_id, status, featured, read_time_minutes, published_at, content)
SELECT
  'Sonia remplace 5 outils et économise 340€/mois',
  'sonia-5-outils-remplaces',
  'Freelance Growth depuis 4 ans, Sonia jonglait entre Typeform, Calendly, Notion, Brevo et Stripe. Un seul abonnement Pretalk pour tout centraliser.',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=500&fit=crop',
  c.id,
  'published',
  false,
  6,
  NOW() - INTERVAL '38 days',
  '<p class="intro">Sonia Marchand est freelance en Growth Marketing depuis 4 ans...</p><h2>Un stack fragmenté à €340/mois</h2><p>Typeform, Calendly, Notion, Brevo, Stripe — la facture mensuelle dépassait les €340.</p>'
FROM cats c WHERE c.slug = 'solopreneur'
ON CONFLICT (slug) DO NOTHING;

WITH cats AS (
  SELECT id, slug FROM blog_categories
)
INSERT INTO blog_posts (title, slug, excerpt, cover_image_url, category_id, status, featured, read_time_minutes, published_at, content)
SELECT
  'Amira double son taux de conversion avec les formulaires IA',
  'amira-coach-conversion',
  'Coach exécutive, Amira ne découvrait le vrai besoin de ses prospects qu''en séance. Le formulaire conversationnel de Pretalk a changé la donne.',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=500&fit=crop',
  c.id,
  'published',
  false,
  7,
  NOW() - INTERVAL '88 days',
  '<p class="intro">Amira Khelil est coach exécutive certifiée depuis 8 ans...</p><h2>Le problème : découvrir trop tard</h2><p>Amira recevait des demandes via un formulaire basique. Elle ne découvrait le vrai blocage qu''après 60 minutes de séance.</p>'
FROM cats c WHERE c.slug = 'coaching'
ON CONFLICT (slug) DO NOTHING;

WITH cats AS (
  SELECT id, slug FROM blog_categories
)
INSERT INTO blog_posts (title, slug, excerpt, cover_image_url, category_id, status, featured, read_time_minutes, published_at, content)
SELECT
  'Marc structure son pipeline et atteint €50k MRR en 3 mois',
  'marc-50k-mrr',
  'Fondateur d''une micro-agence digital, Marc n''avait aucun process de vente. Pretalk lui a permis de construire un pipeline reproductible et prévisible.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=500&fit=crop',
  c.id,
  'published',
  false,
  9,
  NOW() - INTERVAL '124 days',
  '<p class="intro">Marc Dupont dirige une micro-agence de 3 personnes spécialisée en marketing digital...</p><h2>Zéro process, zéro prévisibilité</h2><p>Sans CRM, sans formulaire de qualification, sans scoring, Marc ne savait jamais d''où viendrait son prochain client.</p>'
FROM cats c WHERE c.slug = 'agence'
ON CONFLICT (slug) DO NOTHING;

-- Lier les tags aux posts
WITH p AS (SELECT id FROM blog_posts WHERE slug = 'thomas-3x-closing'),
     t1 AS (SELECT id FROM blog_tags WHERE slug = 'closing'),
     t2 AS (SELECT id FROM blog_tags WHERE slug = 'audit-ia'),
     t3 AS (SELECT id FROM blog_tags WHERE slug = 'high-ticket')
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT p.id, t1.id FROM p, t1 ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'thomas-3x-closing'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'audit-ia')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'thomas-3x-closing'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'high-ticket')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'sonia-5-outils-remplaces'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'solopreneur')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'sonia-5-outils-remplaces'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'stack')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'sonia-5-outils-remplaces'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'productivite')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'amira-coach-conversion'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'coaching')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'amira-coach-conversion'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'formulaires-ia')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'amira-coach-conversion'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'conversion')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'marc-50k-mrr'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'agence')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'marc-50k-mrr'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'pipeline')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;

WITH p AS (SELECT id FROM blog_posts WHERE slug = 'marc-50k-mrr'),
     t AS (SELECT id FROM blog_tags WHERE slug = 'mrr')
INSERT INTO blog_post_tags (post_id, tag_id) SELECT p.id, t.id FROM p, t ON CONFLICT DO NOTHING;
