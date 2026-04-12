# FEATURES_WHATSAPP

## 1) Résumé Exécutif

Le service WhatsApp de Pretalk est une plateforme de conversation commerciale qui combine :
- une inbox temps réel,
- un CRM orienté pipeline,
- une automatisation no-code,
- un agent IA avec handoff humain,
- des campagnes sortantes,
- et des briques e-commerce (catalogue/commandes) pour la vente conversationnelle.

La proposition de valeur principale : **transformer WhatsApp en canal de conversion et de rétention**, sans multiplier les outils.

---

## 2) Problèmes Clients Résolus

### Douleurs fréquentes
- Réponses tardives ou incohérentes aux prospects.
- Messages dispersés entre plusieurs agents, sans historique centralisé.
- Pas de logique d'automatisation pour qualifier, relancer, convertir.
- Difficulté à garder une expérience personnalisée à grande échelle.
- Déconnexion entre conversations WhatsApp et données commerciales (contacts, pipeline, commandes).

### Résultats attendus
- Diminution du temps de réponse.
- Plus de conversations prises en charge sans recruter immédiatement.
- Meilleure qualification des leads et passage plus rapide vers les étapes de vente.
- Meilleure traçabilité (messages, actions IA, notes, statuts).
- Plus d'opportunités de cross-sell et relance post-achat via WhatsApp.

---

## 3) Personas Cibles

- **E-commerçant D2C** : veut convertir plus de trafic social en ventes WhatsApp et suivre les commandes.
- **Équipe commerciale SMB** : veut industrialiser le suivi leads sans perdre la touche humaine.
- **Responsable opérations / support** : veut router vers humain quand nécessaire, suivre la qualité, réduire les oublis.
- **Fondateur / CEO** : veut visibilité KPI (contacts, messages, campagnes) et croissance mesurable.

---

## 4) Fonctionnalités Clés et Valeur Métier

## A. Inbox Omnicanal WhatsApp (Cœur opérationnel)

### Ce que fait le produit
- Centralise les conversations par tenant.
- Affiche la liste des conversations triées par activité.
- Permet lecture historique et gestion du fil de discussion.
- Active une vue combinée "chat + panneau contact CRM".

### Valeur utilisateur
- Plus de contexte en un seul écran.
- Moins de pertes d'information entre agents.
- Meilleure continuité de conversation (moins de "répétitions" côté client).

### Preuves techniques (code)
- Webhook Meta entrant : vérification + réception messages.
- Persistance conversations/messages dans Supabase.
- Mise à jour temps réel via abonnements Supabase et WebSocket.
- Routes front dédiées : inbox, conversation detail.

### Niveau de maturité
- **Élevé** sur ingestion et stockage.
- **Élevé** sur expérience inbox principale.

---

## B. Ticketing/Handover IA-Humain (gestion des cas sensibles)

### Ce que fait le produit
- L'IA peut gérer une conversation tant que le contexte est "safe".
- En cas de seuil/risque, bascule vers humain (HITL).
- La conversation passe en statut `pending_human` avec note explicative.
- Un agent peut reprendre la main (`takeover`) puis relancer l'IA (`release-ai`).

### Valeur utilisateur
- Sécurise l'automatisation sans sacrifier l'expérience client.
- Réduit les erreurs sur dossiers sensibles.
- Crée un mécanisme de "file de tickets" implicite autour des conversations critiques.

### Preuves techniques (code)
- Queue `ai.results` traitée côté backend.
- Si `hitl_triggered`, statut conversation mis à jour + note système insérée.
- Endpoints takeover/release sur conversations.

### Niveau de maturité
- **Élevé** sur mécanique backend de handoff.
- **Moyen à élevé** sur exploitation opérationnelle selon process équipe.

---

## C. Agent IA configurable (chatbot business)

### Ce que fait le produit
- Configuration par tenant :
  - activation IA,
  - langue,
  - prompt système,
  - seuil HITL,
  - voix/voice settings.
- Historique des runs IA (logs).
- Simulateur dans l'interface pour tester les réponses.

### Valeur utilisateur
- Personnalise le ton et les règles métier de la marque.
- Améliore la cohérence des réponses.
- Facilite l'amélioration continue grâce aux logs.

### Preuves techniques (code)
- API `ai/config`, `ai/logs`, `ai/simulate`.
- Stockage config dans table `tenants`.
- Historique dans table `ai_runs`.
- Pipeline RabbitMQ (`ai.tasks` -> `ai.results` -> `whatsapp.outbound`).

### Niveau de maturité
- **Élevé** sur structure de config/logs.
- **Moyen** sur simulation (placeholder visible dans certaines parties UI).

---

## D. Automatisation No-Code (Flow Builder)

### Ce que fait le produit
- Builder visuel de scénarios (drag-and-drop) avec nœuds :
  - trigger message entrant,
  - message texte/média,
  - boutons interactifs,
  - listes,
  - templates,
  - conditions,
  - délais,
  - transfert humain,
  - tags,
  - mouvement pipeline,
  - logique no-reply,
  - vérification stock.
- Sauvegarde des flows par tenant (`nodes_json`, `edges_json`).

### Valeur utilisateur
- Automatise sans dépendre des développeurs.
- Accélère le time-to-market des scénarios commerciaux.
- Permet d'itérer rapidement sur les tunnels conversationnels.

### Preuves techniques (code)
- CRUD backend `flows`.
- Sauvegarde front dans Supabase.
- Structure prête pour exécution (`executeFlow` prévue).

### Niveau de maturité
- **Moyen** : Builder et persistence prêts.
- **Moyen à faible** : moteur d'exécution complet encore à étendre.

---

## E. CRM & Pipeline WhatsApp

### Ce que fait le produit
- Liste contacts avec recherche/filtre.
- Vue pipeline en colonnes (new, qualified, proposed, negotiating, won, lost).
- Drag-and-drop pour changer l'étape commerciale.
- Fiche contact enrichie (inclut commandes).

### Valeur utilisateur
- Transformation de WhatsApp en canal CRM pilotable.
- Vision claire des opportunités à chaque étape.
- Meilleure priorisation commerciale.

### Preuves techniques (code)
- CRUD `contacts` + update `pipeline_stage`.
- Hooks front synchronisés Supabase temps réel.
- Liaison contact <-> orders.

### Niveau de maturité
- **Élevé** sur base CRM/pipeline.

---

## F. Campagnes WhatsApp (broadcast)

### Ce que fait le produit
- Création et listing de campagnes.
- Démarrage campagne avec envoi batch sur contacts du tenant.
- Suivi statut campagne (`running`, `completed`) et trace d'envoi par contact.

### Valeur utilisateur
- Permet promotions, relances, annonces à grande échelle.
- Génère du volume sans exécuter campagne manuellement contact par contact.

### Preuves techniques (code)
- Endpoints campagnes : list/create/start.
- Service backend qui boucle sur les contacts et envoie via couche WhatsApp.
- Table `campaign_contacts` alimentée pour le suivi.

### Niveau de maturité
- **Moyen** : mécanique existante, mais à industrialiser sur rate limiting et orchestration avancée.

---

## G. Templates WhatsApp (Meta)

### Ce que fait le produit
- Liste des templates.
- Création et suppression (structure API prête).
- Affichage statut (APPROVED/PENDING/REJECTED), catégorie et corps.

### Valeur utilisateur
- Standardise les messages à fort impact.
- Aide à rester conforme au modèle Meta template messaging.
- Réduit le temps de production campagne.

### Preuves techniques (code)
- Endpoint templates protégé JWT.
- Intégration Graph API prévue ; fallback mock dev en absence token.

### Niveau de maturité
- **Moyen** : UX et endpoints disponibles, connexion Meta en partie mockée selon environnement.

---

## H. E-commerce conversationnel (catalogue + commandes)

### Ce que fait le produit
- Visualisation produits et commandes dans l'app WhatsApp.
- Sync plateforme e-commerce (YouCan) vers Supabase.
- Préparation des cas d'usage conversationnels : stock, relance commande, assistance achat.

### Valeur utilisateur
- Relie conversations et contexte transactionnel réel.
- Permet des réponses commerciales contextualisées (produit dispo, statut commande, etc.).

### Preuves techniques (code)
- Client YouCan (`getProducts`, `getOrders`).
- Service de synchronisation multi-tenant via table `integrations`.
- Upsert `products` et `orders`.

### Niveau de maturité
- **Moyen** sur backend sync.
- **Variable** sur endpoints exacts exposés selon version déployée.

---

## I. Dashboard et pilotage

### Ce que fait le produit
- KPIs principaux : total contacts, campagnes, messages.
- État compte WhatsApp (numéro, qualité, statut, tier).
- Base visualisation performance messaging.

### Valeur utilisateur
- Vue de pilotage rapide pour décideurs.
- Mesure de l'activité et de la traction du canal WhatsApp.

### Preuves techniques (code)
- Endpoints `dashboard/stats` et `dashboard/whatsapp-account`.
- Données consolidées depuis Supabase.

### Niveau de maturité
- **Moyen à élevé** (certains visuels avec data dummy, KPIs backend présents).

---

## 5) Parcours Utilisateur (de bout en bout)

1. Un prospect envoie un message WhatsApp.
2. Webhook Meta vérifie la signature et accepte l'event.
3. Le système identifie le tenant via `wa_phone_id`.
4. Contact et conversation sont créés/mis à jour.
5. Le message entrant est persisté.
6. Si IA active : publication d'une tâche IA (`ai.tasks`).
7. L'IA renvoie un résultat :
   - soit réponse auto envoyée via Meta,
   - soit escalade humain (`pending_human`).
8. L'équipe suit dans Inbox, ajoute notes, reprend la main si nécessaire.
9. Les actions CRM (pipeline/tags) enrichissent le lead.
10. Des flows/campagnes/templates activent la conversion et la relance.

---

## 6) Architecture Technique (simple à comprendre pour copywriting)

### Stack et composants
- **Frontend** : React (espace WhatsApp), navigation dédiée `/whatsapp/*`.
- **Backend** : NestJS modulaire (conversations, contacts, campaigns, flows, ai, whatsapp, dashboard).
- **Base de données** : Supabase (multi-tenant, stockage conversations/messages/contacts).
- **Messaging async** : RabbitMQ (`whatsapp.outbound`, `ai.tasks`, `ai.results`).
- **Canal externe** : Meta Graph API WhatsApp Business.

### Principes d'architecture
- Multi-tenant strict (tenant_id partout).
- Séparation sync/async (API instantanée + files pour charge).
- Sécurité webhook (HMAC signature).
- Temps réel (Supabase realtime + WebSocket gateway).

### Pourquoi c'est important business
- Fiabilité opérationnelle pour les équipes.
- Scalabilité pour augmenter le volume de conversations.
- Base solide pour automatisation avancée sans réécriture majeure.

---

## 7) Mapping Fonctionnalité -> Bénéfice -> Argument de Vente

| Fonctionnalité | Bénéfice client direct | Angle de vente (copy) |
|---|---|---|
| Inbox temps réel | Réponses plus rapides, moins d'oublis | "Répondez en quelques secondes, pas en quelques heures." |
| Handoff IA->Humain | Risque réduit sur conversations sensibles | "Automatisez en confiance, gardez la main quand il faut." |
| CRM pipeline | Vision claire des opportunités | "Chaque conversation devient une opportunité suivie." |
| Flow Builder no-code | Automatisation sans dépendre d'un dev | "Créez vos scénarios WhatsApp en glisser-déposer." |
| Campagnes | Reach massif avec suivi | "Lancez vos campagnes en minutes et suivez l'impact." |
| Templates | Messages conformes et reproductibles | "Industrialisez vos messages qui convertissent." |
| E-commerce sync | Ventes contextualisées dans le chat | "Le bon message, avec la bonne info commande/stock." |
| Dashboard | Pilotage business rapide | "Pilotez votre croissance WhatsApp en temps réel." |

---

## 8) Objections Fréquentes et Réponses

### "L'IA va répondre n'importe quoi"
Réponse : le système intègre un **seuil HITL** et une **bascule vers agent humain** avec trace explicite.

### "Notre équipe va perdre le contrôle"
Réponse : takeover/release IA natifs + notes + statuts de conversation pour gouverner chaque dossier.

### "On a déjà WhatsApp Business"
Réponse : Pretalk ajoute CRM, automatisation, campagne, analytics et orchestration IA multi-agent.

### "C'est trop technique à déployer"
Réponse : architecture modulaire déjà en place, avec endpoints dédiés, JWT, webhook sécurisé, et composant no-code pour flows.

---

## 9) Preuves de Crédibilité à Utiliser en Landing Page

- Vérification de signature HMAC sur webhooks Meta.
- Architecture asynchrone avec files RabbitMQ.
- Persistance complète conversations/messages/contacts.
- Gestion du handoff IA/humain implémentée côté backend.
- KPI dashboard consolidés côté API.
- Multi-tenant natif (prêt pour agences/multi-marques).

---

## 10) Sections de Landing Page Recommandées (prêtes à rédiger)

### Section Hero
Promesse : "Transformez WhatsApp en machine de conversion assistée par IA."

### Section Problème
Démontrer les pertes invisibles : messages oubliés, suivi manuel, relances non faites.

### Section Solution
Visualiser le triptyque : Inbox + IA + CRM Pipeline.

### Section Fonctionnalités
Blocs orientés résultat :
- Répondre plus vite,
- Qualifier automatiquement,
- Escalader au bon moment,
- Convertir avec campagnes/templates,
- Suivre le chiffre via dashboard.

### Section Cas d'usage
- E-commerce : relance panier, suivi commande, upsell.
- Services : qualification, RDV, relance devis.
- Support : triage + escalade humaine.

### Section Preuves
Mettre en avant la robustesse technique et la traçabilité.

### Section CTA
- "Demander une démo"
- "Activer mon canal WhatsApp"
- "Lancer ma première automatisation"

---

## 11) Ton et Positionnement Copywriting

### Ton recommandé
- Direct, orienté performance commerciale.
- Concret (réduction temps de réponse, plus de conversations traitées, meilleure conversion).
- Rassurant sur le contrôle humain.

### Mots-clés conversion
- "automatisation WhatsApp",
- "agent IA WhatsApp",
- "CRM conversationnel",
- "pipeline WhatsApp",
- "campagnes WhatsApp",
- "handoff humain",
- "vente conversationnelle",
- "support WhatsApp intelligent".

---

## 12) Limites / Transparence Produit (important pour aligner le discours)

- Certaines surfaces UI montrent encore des éléments de démonstration (ex: données fictives sur certains widgets).
- Certaines intégrations (exécution avancée de flows, certaines routes e-commerce selon environnement) sont en cours d'industrialisation.
- Les templates Meta peuvent fonctionner en mode mock en absence de token dans certains environnements.

Recommandation copy : **promettre ce qui est déjà robuste**, et formuler le reste comme "enrichissements continus" plutôt que comme fonctions totalement finalisées.

---

## 13) Synthèse "One-Liner" pour marketing

**Pretalk transforme WhatsApp en système de vente et relation client automatisé : une inbox temps réel, un CRM pipeline, un agent IA avec escalade humaine, et des campagnes/templates pilotés par la donnée.**
