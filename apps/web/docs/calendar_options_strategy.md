# Stratégie de Gestion des Calendriers (Calendar Options)

Ce document détaille la logique de fonctionnement des options de réservation pour les consultants Pretalk et l'impact sur l'automatisation des emails.

## 1. Les Deux Modes de Réservation

Le consultant peut choisir entre deux infrastructures pour gérer ses rendez-vous :

### A. Le Calendrier Public Pretalk (Par défaut)
- **Fonctionnement** : Pretalk gère les créneaux, les disponibilités et les confirmations.
- **Lien** : `https://pretalk.me/[username]`
- **Avantages** : Zéro configuration, branding 100% Pretalk.
- **Limites** : Pas de génération automatique de lien Google Meet (le consultant doit fournir un lien manuel ou appeler).

### B. L'Intégration Google Calendar (Premium)
- **Fonctionnement** : Synchronisation bidirectionnelle avec le compte Google du consultant.
- **Lien** : Redirection vers l'interface de prise de RDV synchronisée Google.
- **Avantages** : Génération automatique de liens **Google Meet**, gestion des conflits avec l'agenda personnel.
- **Limites** : Nécessite une autorisation OAuth.

---

## 2. Logique de "Smart CTA" dans les Emails

Le bouton principal dans l'email de livraison d'audit (`audit_delivery`) s'adapte dynamiquement en fonction du parcours du client.

### État 1 : Le client N'A PAS encore pris rendez-vous
*S'applique si `booking_id` est vide.*
- **Lien du bouton** : `{{ params.booking_link }}` (Lien public du consultant).
- **Texte du bouton** : "Réserver mon coaching gratuit" ou "Prendre RDV".
- **Objectif** : Conversion.

### État 2 : Le client A DÉJÀ pris rendez-vous
*S'applique si `booking_id` est présent.*
- **Action** : Le système vérifie si un lien de réunion (Meet) est généré.
- **Lien du bouton** :
    - Si Google Meet existe -> `{{ params.meeting_link }}`.
    - Sinon -> Lien vers la page récapitulative Pretalk : `https://pretalk.me/booking/[id]`.
- **Texte du bouton** : "Rejoindre la visio (Meet)" ou "Détails de mon rendez-vous".
- **Objectif** : Rétention et logistique.

---

## 3. Matrice de Configuration (Front-End & Backend)

| Variable | Source | Description |
| :--- | :--- | :--- |
| `is_google_connected` | Profil Consultant | Détermine si on peut proposer Meet. |
| `booking_type_preference` | Automations Settings | Nouveau paramètre : 'pretalk' ou 'google'. |
| `has_existing_booking` | Contexte Lead | Détermine le comportement du bouton dans l'email. |

---

## 4. Impact sur le Workflow n8n (Master Email Hub)

Pour supporter cette documentation, le webhook envoyé à n8n doit évoluer pour inclure :

```json
{
  "booking_status": "none | confirmed",
  "meeting_details": {
    "url": "https://meet.google.com/xyz",
    "date": "2024-04-12T10:00:00Z"
  },
  "consultant_calendar_url": "https://pretalk.me/khalid"
}
```

## 5. Exigences UI/UX (Page Settings)

1.  **Toggle de choix** : "Utilisez le calendrier Pretalk" vs "Utilisez mon Google Calendar".
2.  **Statut de connexion** : Indicateur visuel clair si Google est déconnecté (ce qui ferait repasser le système en mode Pretalk par défaut).
3.  **Champ "Lien Visio Manuel"** : Si le consultant n'a pas Google, il doit pouvoir entrer un lien permanent (Zoom, Teams, etc.) pour que le bouton de l'email ne soit pas vide.

---

> [!NOTE]
> Cette documentation servira de base pour la prochaine phase de développement des composants de paramétrage de réservation.
