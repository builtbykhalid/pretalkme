# Pretalk.me - Smart Universal Master Template (V3 - Strict Mode)

Ce document contient la version finale corrigée de la template pour le **Master Email Hub**. 

## ⚖️ Logique de Contenu (Règles Strictes)
Les 3 éléments suivants sont **TOUJOURS FIXES** et ne changent jamais :
1. **Salutation :** "Bonjour {{ params.nom_client }}"
2. **Mention Rapport :** "👉 Votre diagnostic stratégique personnalisé a été ajouté en pièce jointe."
3. **Calendrier :** Le bouton de réservation "{{ params.booking_link }}"

Le reste de l'email est **DYNAMIQUE** :
- **Si `custom_content` est fourni :** On affiche uniquement le texte du consultant entre la salutation et le rapport.
- **Si `custom_content` est vide :** On affiche le message standard court ("Merci pour votre confiance. J'ai analysé vos réponses avec soin...").

---

## 📧 Template HTML Universelle

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre Diagnostic - Pretalk.me</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #091E3F; }
    .main-table { width: 100%; border-collapse: collapse; background-color: #f7f7f7; }
    .content-table { width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0 0 16px 16px; border-top: 8px solid #48D951; overflow: hidden; }
    .header-logo { padding: 40px 35px 20px 35px; text-align: left; }
    .text-section { padding: 20px 35px 40px 35px; line-height: 26px; font-size: 16px; }
    .cta-button { 
      background-color: #006943; color: #ffffff; padding: 18px 40px; 
      text-decoration: none; border-radius: 12px; font-weight: 700; 
      display: inline-block; font-size: 16px; margin: 25px 0;
    }
    .footer-signature { background-color: #0B996E; padding: 40px 35px; color: #ffffff; }
    .legal-footer { padding: 30px; text-align: center; font-size: 11px; color: #9A9A9A; line-height: 1.8; }
    .custom-msg { white-space: pre-line; margin: 20px 0; }
  </style>
</head>
<body>
  <table class="main-table" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="content-table" border="0" cellpadding="0" cellspacing="0">
          
          <!-- LOGO (FIXE) -->
          <tr>
            <td class="header-logo">
              <a href="https://pretalk.me" target="_blank">
                <img src="https://pretalk.me/logo" alt="Pretalk" width="140" border="0">
              </a>
            </td>
          </tr>
          
          <!-- CONTENU (DYNAMIQUE) -->
          <tr>
            <td class="text-section">
              <!-- 1. FIXE : BONJOUR -->
              <p style="margin-top: 0; font-size: 18px; font-weight: 600;">Bonjour {{ params.nom_client }},</p>

              <!-- 2. VARIABLE : MESSAGE -->
              <div class="custom-msg">
                {% if params.custom_content %}
                  {{ params.custom_content }}
                {% else %}
                  Merci pour votre confiance. J'ai analysé vos réponses avec soin et c'est un plaisir de vous transmettre votre diagnostic stratégique.
                {% endif %}
              </div>

              <!-- 3. FIXE : RAPPORT CI-JOINT -->
              <p style="margin: 30px 0; padding: 15px; background: #F8F9FA; border-radius: 8px; text-align: center;">
                👉 <strong>Votre diagnostic stratégique personnalisé a été ajouté en pièce jointe.</strong>
              </p>

              <!-- 4. FIXE : CALENDRIER -->
              <div style="text-align: center; border-top: 1px solid #F1F3F5; margin-top: 30px; padding-top: 30px;">
                <p>
                  {% if params.cta_label contains "Rejoindre" %}
                    Voici le lien pour rejoindre notre réunion à l'heure prévue :
                  {% else %}
                    Pour aller plus loin, je vous propose de choisir un créneau dans mon agenda :
                  {% endif %}
                </p>
                <a href="{{ params.booking_link }}" class="cta-button">
                  {% if params.cta_label %}
                    {{ params.cta_label }}
                  {% else %}
                    📅 Réserver mon débriefing (15 min)
                  {% endif %}
                </a>
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
                  </td>
                  <td align="right">
                    <img src="https://pretalk.me/logo-white" alt="Audit" width="45" style="opacity:0.4;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- FOOTER LÉGAL -->
        <table class="content-table" border="0" cellpadding="0" cellspacing="0" style="background-color: transparent;">
          <tr>
            <td class="legal-footer">
              <p>
                <strong>Pretalk.me</strong> — IA & Conseil.<br>
                17 rue Salneuve, 75017 Paris
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
