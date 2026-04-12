# Guide d'utilisation des prompts agents — pretalkme
> Ces prompts sont conçus pour être donnés à des agents IA (Claude Code, Cursor, Copilot, etc.)
> Chaque prompt est autonome et contient tout le contexte nécessaire pour la mission.

---

## Comment utiliser ces prompts

1. **Toujours joindre `00-context-global.md`** au début de chaque session agent, ou inclure son contenu dans le prompt système.
2. **Joindre `LEADR_SPEC.md`** (à la racine du repo) pour le plan CTO complet.
3. Donner le prompt de la mission spécifique à l'agent.
4. L'agent doit travailler dans le repo `pretalkme/` (monorepo).

---

## Ordre d'exécution recommandé

```
Phase 1 — Fondations (faire en premier, bloque tout le reste)
  └── Agent 08 : Database Supabase        ← Exécuter les scripts SQL en premier
  └── Agent 09 : Infra Coolify/Cloudflare ← Setup serveur et services
  └── Agent 01 : Setup Monorepo           ← Créer la structure du repo

Phase 2 — Backend
  └── Agent 06 : API NestJS               ← Backend complet
  └── Agent 07 : Service IA FastAPI       ← Pipeline STT/LLM/TTS

Phase 3 — Frontend
  └── Agent 02 : Purge & Adaptation web   ← Nettoyer pretalk-hub
  └── Agent 03 : UI Inbox                 ← Page principale (priorité haute)
  └── Agent 04 : UI Pages secondaires     ← CRM, E-com, Flows, AI, Settings
  └── Agent 05 : Marketing & SEO          ← Landing pages Astro
```

---

## Index des prompts

| Fichier | Mission | Projet | Phase |
|---------|---------|--------|-------|
| [00-context-global.md](00-context-global.md) | Contexte global à inclure partout | — | — |
| [01-setup-monorepo.md](01-setup-monorepo.md) | Créer Turborepo + scaffold tous les projets | Root | 1 |
| [02-web-purge-et-adaptation.md](02-web-purge-et-adaptation.md) | Nettoyer pretalk-hub pour pretalkme | apps/web | 3 |
| [03-web-ui-inbox.md](03-web-ui-inbox.md) | Construire l'Inbox WhatsApp (page principale) | apps/web | 3 |
| [04-web-ui-pages-secondaires.md](04-web-ui-pages-secondaires.md) | CRM, E-Com, AI Agent, Flows, Settings | apps/web | 3 |
| [05-web-marketing-seo.md](05-web-marketing-seo.md) | Landing page + pages verticales Astro | apps/web | 3 |
| [06-api-backend-nestjs.md](06-api-backend-nestjs.md) | Backend NestJS complet (API + WS + RabbitMQ) | apps/api | 2 |
| [07-ai-service-fastapi.md](07-ai-service-fastapi.md) | Service IA Python (STT + LLM + TTS + RAG) | services/ai | 2 |
| [08-database-supabase.md](08-database-supabase.md) | Schéma DB + RLS + RPC Supabase | Supabase | 1 |
| [09-infra-coolify-cloudflare.md](09-infra-coolify-cloudflare.md) | Déploiement Coolify + DNS Cloudflare + R2 | Infra | 1 |

---

## Conseils pour les agents

- **Lire le contexte global** avant de commencer
- **Ne pas réinventer** ce qui existe déjà dans pretalk-hub (design system, auth)
- **Toujours typer** avec les types de `packages/shared/types/`
- **Tester** avec la commande de vérification à la fin de chaque prompt
- **Committer** par petites unités (une feature = un commit)

---

## Contact projet

Projet : **pretalkme** | Repo : `github.com/[org]/pretalkme`
Document CTO : `LEADR_SPEC.md` à la racine de pretalk-hub
