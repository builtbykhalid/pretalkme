# Pretalk.me - Smart Universal Master Template (Master Email Hub)

Ce document contient la version finale de la template HTML pour le **Master Email Hub**. Elle est conçue pour fonctionner avec le mapping de variables défini dans votre workflow n8n et gère dynamiquement l'affichage : soit le contenu standard Pretalk, soit le message personnalisé du consultant.

## 🛠️ Logique d'affichage (Mapping n8n)
La template utilise la variable `{{ params.custom_content }}` (qui est mappée sur `params.custom_body` dans votre Master Hub) :
- **Si `custom_content` est vide :** Affiche le bloc de contenu standard (Points forts, etc.).
- **Si `custom_content` est rempli :** Affiche le message du consultant avec conservation des sauts de ligne.

---

## 📧 Template HTML Universelle Premium

```html
<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Votre Diagnostic - Pretalk.me</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; -webkit-font-smoothing: antialiased; }
    .main-table { width: 100%; border-collapse: collapse; background-color: #f7f7f7; }
    .content-table { width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0 0 16px 16px; border-top: 8px solid #48D951; overflow: hidden; }
    .header-logo { padding: 40px 35px 20px 35px; text-align: left; }
    .text-section { padding: 20px 35px 40px 35px; color: #091E3F; line-height: 26px; font-size: 16px; }
    .standard-block { background-color: #F8F9FA; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #E9ECEF; }
    .cta-button { 
      background-color: #006943; color: #ffffff; padding: 18px 40px; 
      text-decoration: none; border-radius: 12px; font-weight: 700; 
      display: inline-block; font-size: 16px; margin: 25px 0;
    }
    .footer-signature { background-color: #0B996E; padding: 40px 35px; color: #ffffff; }
    .legal-footer { padding: 30px; text-align: center; font-size: 11px; color: #9A9A9A; line-height: 1.8; }
    a { color: #0B996E; text-decoration: none; }
    .custom-msg { white-space: pre-line; margin-bottom: 25px; }
  </style>
</head>
<body>
  <table class="main-table" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <!-- WRAPPER -->
        <table class="content-table" border="0" cellpadding="0" cellspacing="0">
          
          <!-- LOGO -->
          <tr>
            <td class="header-logo">
              <a href="https://pretalk.me" target="_blank">
                <img src="https://pretalk.me/logo" alt="Pretalk" width="140" border="0">
              </a>
            </td>
          </tr>
          
          <!-- CORPS DU MAIL -->
          <tr>
            <td class="text-section">
              <p style="margin-top: 0; font-size: 18px; font-weight: 600;">Bonjour {{ params.nom_client }},</p>

              <!-- CONDITION : MESSAGE DU CONSULTANT OU STANDARD -->
              {% if params.custom_content %}
                <!-- AFFICHAGE DU MESSAGE PERSONNALISÉ -->
                <div class="custom-msg">
                  {{ params.custom_content }}
                </div>
              {% else %}
                <!-- AFFICHAGE DU MESSAGE STANDARD PAR DÉFAUT -->
                <p>Merci pour votre confiance. J'ai analysé vos réponses avec soin et c'est un plaisir de vous transmettre votre <strong>diagnostic stratégique sur-mesure</strong>.</p>
                
                <div class="standard-block">
                  <p style="margin-top:0; font-weight:700; color:#006943;">Dans votre audit, vous trouverez :</p>
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td width="30" valign="top" style="padding-top:4px;">✅</td>
                      <td style="padding-bottom:12px;">Une analyse de vos <strong>points forts actuels</strong>.</td>
                    </tr>
                    <tr>
                      <td width="30" valign="top" style="padding-top:4px;">✅</td>
                      <td style="padding-bottom:12px;">L'identification des <strong>freins à votre croissance</strong>.</td>
                    </tr>
                    <tr>
                      <td width="30" valign="top" style="padding-top:4px;">✅</td>
                      <td style="padding-bottom:0;">Mes <strong>recommandations prioritaires</strong>.</td>
                    </tr>
                  </table>
                </div>

                <p>👉 <strong>Votre rapport complet a été ajouté en pièce jointe de cet email.</strong></p>
              {% endif %}

              <!-- ÉLÉMENTS FIXES : DÉBRIEFING & CTA -->
              <div style="text-align: center; border-top: 1px solid #F1F3F5; margin-top: 30px; padding-top: 30px;">
                <p style="margin-top:0; font-weight: 600;">Et maintenant ?</p>
                <p>Je vous propose de prendre 15 minutes ensemble pour débriefer ces résultats et définir votre prochain plan d'action.</p>
                <a href="{{ params.booking_link }}" class="cta-button">📅 Choisir mon créneau</a>
              </div>
            </td>
          </tr>

          <!-- SIGNATURE -->
          <tr>
            <td class="footer-signature">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">Au plaisir d'échanger,</p>
                    <p style="margin: 5px 0 0 0; font-weight: 700; font-size: 18px;">{{ params.nom_consultant }}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; opacity: 0.8;">Expert Partenaire Pretalk.me</p>
                  </td>
                  <td align="right">
                    <img src="https://pretalk.me/logo-white" alt="Audit" width="45" style="opacity:0.4;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- FOOTER LÉGAL AUTOMATIQUE -->
        <table class="content-table" border="0" cellpadding="0" cellspacing="0" style="background-color: transparent;">
          <tr>
            <td class="legal-footer">
              <p>
                <strong>Pretalk.me</strong> — L'intelligence artificielle au service du conseil.<br>
                17 rue Salneuve, 75017 Paris<br>
                <a href="https://pretalk.me/privacy">Confidentialité</a> | <a href="https://pretalk.me/legal">Mentions légales</a>
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

## 🔗 Intégration dans le Master Hub (Node Mapping)

Pour que la template affiche correctement le message, votre node `Définir Langue & Template Brevo` est déjà configuré ligne 41 pour remplir `custom_content` :

```javascript
// Votre workflow actuel (lignes 40-42) :
if (params.custom_body) {
  params.custom_content = params.custom_body;
}
```

**Instruction pour Brevo :**
Il vous suffit de copier ce code HTML dans l'éditeur de template Brevo. Assurez-vous d'activer le support de la syntaxe **Liquid** ou **Handlebars** dans Brevo pour que les balises `{% if %}` soient interprétées.
