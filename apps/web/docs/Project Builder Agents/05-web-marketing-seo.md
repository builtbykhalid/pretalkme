# AGENT 05 — Landing Page WhatsApp IA (Simple Page pretalk.me)
> **⚠️ STATUT : DIFFÉRÉ — Ne pas traiter maintenant.**
> Le travail prioritaire est l'application (`/whatsapp/*`).
> Ce prompt sera activé une fois que l'app est fonctionnelle.

---

## Contexte & Décision

La décision a été prise de **ne pas créer une landing page complète** pour l'instant.
Les pages marketing et SEO existantes de `pretalk.me` sont conservées telles quelles — **on n'y touche pas**.

À la place, une **simple page dédiée** sera ajoutée à `pretalk.me/whatsapp-ai-agents` pour présenter la fonctionnalité WhatsApp IA.

---

## Ce que cette page doit faire (quand activée)

Une seule page Astro légère sur le site `pretalk.me` existant :

```
pretalk.me/whatsapp-ai-agents
```

### Contenu minimal

```astro
---
// src/pages/whatsapp-ai-agents.astro
// Page simple — pas de nouveau layout, utiliser le layout existant de pretalk.me
const title = "WhatsApp IA Agent — Vendez sur WhatsApp 24h/24 | pretalk.me"
const description = "Agent vocal IA pour WhatsApp : répond en Darija, vérifie le stock, confirme les commandes. Intégré avec YouCan & Shopify. Essai gratuit 14 jours."
---

<!-- Hero simple -->
<h1>Votre agent vocal IA sur WhatsApp</h1>
<p>Qualifie vos prospects, répond aux voice notes, confirme les commandes — automatiquement, 24h/24 en Darija et Français.</p>

<!-- 3 points clés (pas de section longue) -->
<ul>
  <li>🎤 Reçoit et envoie des voice notes (Darija/FR/AR)</li>
  <li>📦 Vérifie le stock en temps réel (YouCan, Shopify)</li>
  <li>👥 Équipe de vente IA + humaine dans une inbox partagée</li>
</ul>

<!-- CTA -->
<a href="https://app.pretalk.me/whatsapp/onboarding">Essayer gratuitement 14 jours →</a>

<!-- Prix simple -->
<p>À partir de 690 MAD/mois · Sans engagement · Garantie 14 jours</p>
```

### SEO Meta Tags

```astro
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<link rel="canonical" href="https://pretalk.me/whatsapp-ai-agents" />
```

---

## Ce qu'on NE fait PAS dans ce prompt

- ❌ Pas de nouveau design system
- ❌ Pas de sections longues (Hero, Features, Pricing, FAQ, Testimonials)
- ❌ Pas de nouvelles pages verticales (/solutions/ecommerce, etc.)
- ❌ Pas de modification des pages existantes de pretalk.me
- ❌ Pas de composants Landing/ complexes

---

## Quand activer ce prompt ?

Activer ce prompt une fois que :
1. L'app `/whatsapp/*` est fonctionnelle et déployée
2. On a les premiers retours utilisateurs
3. On est prêt à investir dans le marketing

---

## ⚠️ Actions à faire par le propriétaire du projet (toi)

```
□ Ajouter un lien dans la navigation de pretalk.me vers /whatsapp-ai-agents
  (optionnel — peut être fait manuellement dans le header existant)

□ Créer une image OG dédiée (1200x630px) pour le partage social
  → Texte : "pretalkme WhatsApp IA — Agent vocal pour e-commerçants MENA"
  → À placer dans public/og/whatsapp-ai-agents.png
```
