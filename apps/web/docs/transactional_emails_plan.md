# Pretalk.me - Transactional Email Workflow & Requirements

Ce document structure les emails transactionnels nécessaires au bon fonctionnement de la plateforme Pretalk, classés par parcours utilisateur et finalité.

> [!NOTE]
> Les emails d'authentification (Section 1) sont gérés via Supabase et sont documentés séparément dans [auth_email_templates.md](./auth_email_templates.md).

---

## 2. Pour le Consultant (Notifications Plateforme)
Emails envoyés au consultant pour l'informer de l'activité sur son espace.

| Événement | Description | Fréquence |
| :--- | :--- | :--- |
| **Nouveau Lead reçu** | Notification dès qu'un prospect soumet un formulaire. | Immédiat |
| **Nouvelle Réservation** | Confirmation d'un rendez-vous pris par un client. | Immédiat |
| **Annulation / Report** | Notification si le client modifie son créneau. | Immédiat |
| **Échec Sync Calendrier** | Alerte si le token Google/Outlook a expiré. | Une fois |
| **Invitation Collaborateur** | Notification d'ajout à une équipe (si activé). | Immédiat |

---

## 3. Pour le Client du Consultant (Leads & Prospects)
Emails envoyés aux clients finaux du consultant. Pretalk agit en tant que facilitateur (White Label).
*Note : Pretalk ne gère pas les encaissements pour le compte du consultant.*

| Événement | Description | Contenu Clé |
| :--- | :--- | :--- |
| **Confirmation Formulaire** | Accusé de réception après soumission. | Récapitulatif + Prochaine étape |
| **Confirmation Booking** | Détails du rendez-vous. | Lien Visio (Meet/Zoom) + fichier .ics |
| **Rappels (J-1 / H-1)** | Rappels automatiques pour éviter les no-shows. | Détails + Lien d'annulation |
| **Audit Delivery** | **[Nouveau]** Envoi automatique/manuel de l'audit généré. | Lien vers le PDF/Rapport |
| **Proposition Commerciale** | **[Nouveau]** Envoi de l'offre suite à l'analyse. | Lien vers la proposition |
| **Signature de Contrat** | **[Nouveau]** Notification de contrat prêt à signer. | Lien vers l'outil de signature |
| **Modif. / Annulation** | Notification de changement de créneau. | Nouveau créneau ou motif |

---

## 4. Finances & Abonnements (Pretalk -> Consultant)
Gestion de la relation commerciale entre la plateforme et ses utilisateurs.
*Note : La majorité de ces emails sont initiés/gérés par la passerelle de paiement (Stripe/RevenueCat).*

| Événement | Description | Importance |
| :--- | :--- | :--- |
| **Essai Transformé** | **[Modification]** Email après que l'utilisateur a fini l'onboarding et intégré ses outils. | Élevé (Engagement) |
| **Choix de Plan / Upgrade** | **[Nouveau]** Félicitations suite au passage à un plan supérieur. | Moyen |
| **Échec de Paiement** | Notification de problème avec la carte enregistrée. | Critique |
| **Confirmation Abonnement** | Reçu de facturation mensuelle/annuelle Pretalk. | Légal |

---

## 5. Système & Administration
Communications globales liées à la stabilité et à l'évolution de la plateforme.

| Événement | Description | Type |
| :--- | :--- | :--- |
| **Nouvelle Fonctionnalité** | Annonce d'une mise à jour majeure (ex: nouvel agent AI). | Produit |
| **Maintenance Critique** | Intervention technique impactant l'accès au service. | Alerte |
| **Mise à jour Légale** | Changement des CGU ou politique de confidentialité. | Légal |

---

## Spécifications Techniques

### Expéditeurs (Sender Identities)
*   **Plateforme Pretalk :** `support@pretalk.me` (Pour le consultant).
*   **Whitelabel / Relay :** `notifications@pretalk.me` (Au nom du consultant pour ses clients).

### Outils Recommandés
*   **Moteur d'envoi :** Resend (excellent pour React/Astro).
*   **Workflows :** n8n (déjà présent dans le projet) pour lier les triggers DB (Supabase) aux envois mails.
*   **Tracking :** Activer le suivi des ouvertures pour les propositions et contrats.
