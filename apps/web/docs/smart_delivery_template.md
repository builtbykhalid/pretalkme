# Pretalk.me - Smart Universal Delivery Template (Standard vs Custom)

Ce document contient la version HTML "Smart" du mail de livraison d'audit. Cette template est conçue pour gérer dynamiquement le contenu : si le consultant fournit un message personnalisé, il est utilisé ; sinon, un message standard de haute qualité est affiché par défaut.

## 🛠️ Logique de la Template (Workflow n8n)
La variable `{{ params.custom_message }}` doit être passée par le workflow. 
- **Si `custom_message` est vide ou nul :** La template affiche les blocs standards (Points forts, Opportunités, Recommandations).
- **Si `custom_message` contient du texte :** Ce texte remplace intégralement le corps du message standard.

---

## 📧 Template HTML Universelle

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre Diagnostic Stratégique - Pretalk</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #091E3F; }
    .main-table { width: 100%; border-collapse: collapse; background-color: #f7f7f7; }
    .content-table { width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header-logo { padding: 30px 0; text-align: center; border-bottom: 8px solid #48D951; }
    .text-section { padding: 40px 35px; line-height: 24px; font-size: 16px; }
    .standard-block { background-color: #F8F9FA; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .cta-button { 
      background-color: #006943; color: #ffffff; padding: 18px 35px; 
      text-decoration: none; border-radius: 12px; font-weight: 700; 
      display: inline-block; font-size: 16px; margin: 30px 0;
    }
    .footer-signature { background-color: #0B996E; padding: 35px; color: #ffffff; }
    .legal-footer { padding: 30px; text-align: center; font-size: 11px; color: #9A9A9A; line-height: 1.6; }
  </style>
</head>
<body>
  <table class="main-table" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <!-- HEADER -->
        <table class="content-table" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header-logo">
              <a href="https://pretalk.me" target="_blank">
                <img src="https://pretalk.me/logo" alt="Pretalk" width="160" border="0">
              </a>
            </td>
          </tr>
          
          <!-- BODY CONTENT -->
          <tr>
            <td class="text-section">
              <p style="margin-top: 0;">Bonjour {{ params.nom_client }},</p>

              <!-- LOGIQUE DYNAMIQUE : MESSAGE CUSTOM OU STANDARD -->
              {% if params.custom_message %}
                <!-- MESSAGE PERSONNALISÉ DU CONSULTANT -->
                <div style="margin: 20px 0; white-space: pre-line; line-height: 26px;">
                  {{ params.custom_message }}
                </div>
              {% else %}
                <!-- MESSAGE STANDARD PAR DÉFAUT -->
                <p>Merci pour votre confiance. J'ai analysé vos réponses avec soin et j'ai le plaisir de vous transmettre votre <strong>diagnostic stratégique personnalisé</strong>.</p>
                
                <div class="standard-block">
                  <p style="margin-top:0; font-weight:700; color:#006943;">Ce que contient votre audit :</p>
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td width="25" valign="top" style="padding-top:5px;">✅</td>
                      <td style="padding-bottom:10px;">Analyse de vos <strong>points forts actuels</strong>.</td>
                    </tr>
                    <tr>
                      <td width="25" valign="top" style="padding-top:5px;">✅</td>
                      <td style="padding-bottom:10px;">Identification des <strong>bloqueurs de croissance</strong>.</td>
                    </tr>
                    <tr>
                      <td width="25" valign="top" style="padding-top:5px;">✅</td>
                      <td style="padding-bottom:0;">Mes <strong>recommandations prioritaires</strong>.</td>
                    </tr>
                  </table>
                </div>

                <p>👉 Vous trouverez votre rapport complet en pièce jointe de cet email.</p>
              {% endif %}

              <!-- ÉLÉMENTS TOUJOURS PRÉSENTS : BOOKING & SIGNATURE -->
              <div style="text-align: center; padding-top: 20px;">
                <p style="font-weight: 600;">La prochaine étape ? Débriefer ensemble ce document.</p>
                <p>Choisissez le créneau qui vous convient le mieux dans mon agenda :</p>
                <a href="{{ params.booking_link }}" class="cta-button">📅 Réserver mon débriefing (15 min)</a>
              </div>
            </td>
          </tr>

          <!-- SIGNATURE -->
          <tr>
            <td class="footer-signature">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">À très bientôt,</p>
                    <p style="margin: 5px 0 0 0; font-weight: 700; font-size: 18px;">{{ params.nom_consultant }}</p>
                    {% if params.nom_entreprise %}
                      <p style="margin: 2px 0 0 0; font-size: 13px; opacity: 0.8;">{{ params.nom_entreprise }}</p>
                    {% endif %}
                  </td>
                  <td align="right">
                    <img src="https://pretalk.me/logo-white" alt="Audit by Pretalk" width="50" style="opacity:0.5;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- LEGAL FOOTER -->
        <table class="content-table" border="0" cellpadding="0" cellspacing="0" style="background-color: transparent;">
          <tr>
            <td class="legal-footer">
              <p>
                <strong>Pretalk.me</strong> — L'IA au service de votre croissance commerciale.<br>
                17 rue Salneuve, 75017 Paris<br>
                <a href="https://pretalk.me/privacy" style="color: #0B996E;">Confidentialité</a> | <a href="https://pretalk.me/contact" style="color: #0B996E;">Assistance</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🏗️ Guide d'intégration n8n (Node Code)

Pour que la logique "Standard vs Custom" fonctionne, voici comment préparer les données dans votre node de préparation de mail :

```javascript
// Exemple de logique à insérer dans le workflow "Livreur PDF"
const lead = $('Get Lead Data').item.json;
const consultant = $('Get Consultant Profile').item.json;

// Si le consultant a saisi un message spécifique dans le formulaire de validation/livraison
const customMessage = $node["Webhook"].json.body.custom_email_body || "";

return {
  params: {
    nom_client: lead.respondent_info?.name || "Client",
    nom_consultant: consultant.full_name || "Votre Consultant",
    nom_entreprise: consultant.company_name || "",
    booking_link: consultant.booking_url || "https://pretalk.me/calendar",
    custom_message: customMessage, // Sera soit du texte, soit vide
    email_client: lead.respondent_info?.email
  }
};
```
