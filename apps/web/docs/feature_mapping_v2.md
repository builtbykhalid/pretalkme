# 🗺️ Cartographie des Fonctionnalités Pretalk-Hub

Ce document dresse une liste exhaustive des fonctionnalités de la plateforme, organisées par cycle de vie de la consultation et par rôle utilisateur, après la refonte majeure de l'interface de revue.

---

## 🏗️ 1. Phase A : Capture & Qualification (Pré-Consultation)
*L'objectif est d'attirer le prospect, de le qualifier automatiquement et de préparer l'expert.*

### 👤 Pour le Consultant
| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Profil Public Dynamique** | Page personnelle personnalisable (`/app/:username`) avec bio, réseaux et liens. | ✅ Opérationnel |
| **Form Builder IA** | Créateur de formulaires avec génération de questions par IA (n8n). | ✅ Opérationnel |
| **Gestion des Availabilities** | Synchronisation Google Calendar, gestion des buffers et fuseaux horaires. | ✅ Opérationnel |
| **Configuration PDF** | Personnalisation des templates d'audit (couvertures, logo, CTA). | ✅ Opérationnel |
| **Dashboard Leads** | Pipeline de gestion des nouveaux contacts entrants avec scoring IA. | ✅ Opérationnel |
| **Contrôle d'Automatisation** | Activation/Désactivation de la génération automatique d'Audit & Propositions. | ✅ Opérationnel |

### 👥 Pour le Client (Prospect)
| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Qualification Socratique** | Tunnel de questions dynamiques posées par l'IA selon les réponses précédentes. | ✅ Opérationnel |
| **Réponse Vocale** | Enregistrement audio transcrit par IA pour plus de confort. | ✅ Opérationnel |
| **Booking Instantané** | Prise de RDV simplifiée après la soumission du formulaire. | ✅ Opérationnel |
| **Consultation Payante** | Intégration de paiement pour les sessions de conseil facturées à l'entrée. | ✅ Opérationnel |

---

## 🎙️ 2. Phase B : Live Expert Interface (Consultation)
*L'objectif est de structurer l'échange en direct et de maximiser la valeur perçue.*

### 👤 Pour le Consultant
| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Interface Salle de Contrôle** | Vue optimisée avec contexte briefing à gauche et zone de travail à droite. | ✅ Opérationnel |
| **Assistant de Questionnement** | Rappel des points de douleur stratégiques identifiés lors de la Phase A. | ✅ Opérationnel |
| **Live Note Taker Assistant** | Zone de notes en vrac que l'IA peut synchroniser avec l'audit à la fin de l'appel. | ✅ Opérationnel |
| **Transcription Live** | Zone dédiée pour injecter la transcription de l'échange (IA capable de filtrer le bruit). | ✅ Opérationnel |
| **Évaluation "Feeling"** | Score émotionnel et psychologique capté durant l'échange. | ✅ Opérationnel |

---

## 📊 3. Phase C : Ingénierie & Proposition (Post-Consultation)
*L'objectif est de structurer l'offre commerciale et de valider l'audit expert.*

### 👤 Pour le Consultant
| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Navigation par Étapes** | Stepper intuitif (Audit ⮕ Offres ⮕ Contrat ⮕ Kickoff ⮕ Finance). | ✅ Opérationnel |
| **Édition d'Audit Bloc par Bloc** | Modification visuelle des résultats de diagnostic et des graphiques de maturité. | ✅ Opérationnel |
| **Éditeur d'Offres (MTA)** | Gestion de multiples options commerciales avec accroches et détails éditables. | ✅ Opérationnel |
| **Génération de Devis** | Création de devis PDF en un clic à partir d'une proposition commerciale. | ✅ Opérationnel |
| **IA Booster (Regen)** | Ajustement stratégique de l'audit ou des propositions via prompt contextuel. | ✅ Opérationnel |
| **Master Email Hub** | Envoi automatisé de l'audit et des offres avec tracking. | ✅ Opérationnel |

---

## ✍️ 4. Phase D : Contrat & Signature (Closing)
*L'objectif est de sécuriser la mission juridiquement et financièrement.*

### 👤 Pour le Consultant
| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Contrat IA Automatique** | Génération des clauses contractuelles basées sur les offres validées. | ✅ Opérationnel |
| **Éditeur de Clauses Focus** | Interface dédiée (Dark Mode) pour la relecture et l'ajustement du contrat. | ✅ Opérationnel |
| **Workflow de Signature** | Bouton d'envoi rapide du lien de signature électronique au client. | ✅ Opérationnel |

---

## 🚀 5. Phase E : Kickoff & Onboarding (Activation)
*L'objectif est de lancer la mission et de collecter les infos techniques.*

| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Formulaire de Kickoff** | Génération auto d'un formulaire de briefing technique pour le client gagné. | ✅ Opérationnel |
| **Activation Client** | Workflow de lancement de l'onboarding (Checklist, accès, outils). | ✅ Opérationnel |
| **Lien Public Kickoff** | Espace client sécurisé pour la soumission des éléments de démarrage. | ✅ Opérationnel |

---

## 💰 6. Phase F : Finance & Billing (Gestion)
*L'objectif est de suivre les paiements et de gérer l'administratif.*

| Fonctionnalité | Description | Statut |
| :--- | :--- | :--- |
| **Module Finance** | Suivi des encaissements et des statuts de paiement (CA vs Net). | 🛠️ En cours |
| **Gestion des Reçus** | Automatisation de l'envoi des reçus de paiement après confirmation. | 🛠️ En cours |

---

## 🛠️ Platform Operations & Core
| Fonctionnalité | Description | Type |
| :--- | :--- | :--- |
| **Cortex Engine** | Orchestration multi-agents (IA spécialisées p. ex. McKinsey, Bain). | Socle |
| **Supabase Architecture** | Realtime data, RLS security, et gestion des fichiers (PDF/Images). | Socle |
| **Pipeline n8n** | Automatisation des traitements asynchrones et des générations lourdes. | Socle |
| **UI Design System** | Langage visuel Premium "taap.it" : minimalisme, verre, et typographie Outfit. | Design |
