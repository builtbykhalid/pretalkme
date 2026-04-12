# Pretalk.me - Premium Audit Delivery Email Template

Ce document contient la version HTML "Premium" du mail de livraison d'audit, basée sur la structure demandée (inspirée du design Brevo) et adaptée avec le branding Pretalk.

## 🎨 Branding Appliqué
- **Couleur Primaire :** `#48D951` (Vert Pretalk)
- **Couleur Fond :** `#F7F7F7` (Gris clair)
- **Couleur Texte :** `#091E3F` (Bleu nuit)
- **Variables :** `{{ params.nom_client }}`, `{{ params.nom_consultant }}`, `{{ params.score_ia }}`, `{{ params.booking_link }}`, `{{ params.custom_content }}`.

---

## 📧 Template HTML Final (Français)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre Audit Stratégique Pretalk</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; }
    .main-table { background-color: #f7f7f7; width: 100%; border-collapse: collapse; }
    .content-table { background-color: #ffffff; width: 600px; margin: 0 auto; table-layout: fixed; }
    .header-banner { background-color: #E8FDDF; padding: 20px; text-align: center; }
    .text-section { padding: 40px 35px; color: #091E3F; line-height: 24px; font-size: 16px; }
    .step-item { padding: 15px 35px; background-color: #ffffff; }
    .cta-button { 
      background-color: #006943; 
      color: #ffffff; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 12px; 
      font-weight: 600; 
      display: inline-block;
      font-size: 16px;
    }
    .footer { background-color: #0B996E; padding: 40px 35px; color: #ffffff; }
    .legal { padding: 20px; text-align: center; font-size: 11px; color: #999; }
  </style>
</head>
<body style="background-color: #f7f7f7;">
  <table class="main-table" border="0" cellpadding="0" cellspacing="0" width="100%">
    <!-- HEADER LOGO -->
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://pretalk.me" target="_blank">
                <img src="https://pretalk.me/logo" alt="Pretalk.me" width="180" border="0" style="display:block;">
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BANNER IMAGE / COLOR BAR -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td style="background-color: #48D951; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- MAIN CONTENT -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td class="text-section">
              <p style="margin-top: 0; font-weight: 700; font-size: 18px;">Bonjour {{ params.nom_client }},</p>
              <p>Merci d'avoir pris le temps de m'en dire plus sur vos objectifs et vos défis actuels.</p>
              <p>J'ai analysé vos réponses avec soin pour identifier ce qui freine aujourd'hui votre croissance. Comme convenu, j'ai synthétisé mes observations dans un <strong>diagnostic stratégique sur-mesure</strong>.</p>
              <p style="margin-bottom: 0;"><strong>Voici ce que vous allez découvrir dans votre audit :</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- STEPS / HIGHLIGHTS -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td style="padding: 0 35px 30px 35px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <!-- Point 1 -->
                <tr>
                  <td width="30" valign="top" style="padding-top: 4px;">
                    <img src="https://beeag.r.bh.d.sendibt3.com/im/14406/810bb52a089b237cef7dccf3f019b2f9ae313323734031395983b76f7ef38775.png" width="15" alt="check">
                  </td>
                  <td style="padding-bottom: 15px; font-size: 16px;">
                    <strong>Vos points forts actuels</strong> sur lesquels capitaliser.
                  </td>
                </tr>
                <!-- Point 2 -->
                <tr>
                  <td width="30" valign="top" style="padding-top: 4px;">
                    <img src="https://beeag.r.bh.d.sendibt3.com/im/14406/810bb52a089b237cef7dccf3f019b2f9ae313323734031395983b76f7ef38775.png" width="15" alt="check">
                  </td>
                  <td style="padding-bottom: 15px; font-size: 16px;">
                    <strong>Les opportunités manquées</strong> dues aux zones d'ombre identifiées.
                  </td>
                </tr>
                <!-- Point 3 -->
                <tr>
                  <td width="30" valign="top" style="padding-top: 4px;">
                    <img src="https://beeag.r.bh.d.sendibt3.com/im/14406/810bb52a089b237cef7dccf3f019b2f9ae313323734031395983b76f7ef38775.png" width="15" alt="check">
                  </td>
                  <td style="padding-bottom: 15px; font-size: 16px;">
                    <strong>Mes recommandations prioritaires</strong> pour inverser la tendance.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- REPORT LINK / PIECE JOINTE -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9f9f9; border-radius: 12px;">
          <tr>
            <td style="padding: 25px 35px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #006943;">👉 <strong>Votre rapport complet est joint à cet email.</strong></p>
              <p style="font-style: italic; font-size: 14px; margin-top: 10px;">{{ params.custom_content }}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA DEBRIEF -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; padding-top: 40px;">
          <tr>
            <td style="padding: 0 35px 40px 35px; text-align: center;">
              <h2 style="font-size: 20px; color: #091E3F; margin-bottom: 20px;">Prêt à passer à l'action ?</h2>
              <p style="margin-bottom: 30px;">Prenons 15 minutes pour débriefer ce document et voir comment l'appliquer précisément à votre situation.</p>
              <a href="{{ params.booking_link }}" class="cta-button">📅 Réserver mon débriefing</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER SIGNATURE -->
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B996E; border-top: 2px solid #ffffff;">
          <tr>
            <td style="padding: 40px 35px; color: #ffffff;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="80" valign="top">
                    <!-- Placeholder for consultant avatar or small logo -->
                    <img src="https://pretalk.me/logo-white" alt="Signature" width="60" style="opacity: 0.8;">
                  </td>
                  <td valign="middle">
                    <p style="margin: 0; font-size: 16px;">Au plaisir d'échanger avec vous,</p>
                    <p style="margin: 5px 0 0 0; font-weight: 700; font-size: 18px;">{{ params.nom_consultant }}</p>
                    <p style="margin: 0; font-size: 13px; opacity: 0.8;">Expert Partenaire Pretalk.me</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- LEGAL FOOTER -->
    <tr>
      <td align="center" style="padding: 30px 0;">
        <p style="margin: 0; font-size: 11px; color: #9A9A9A; line-height: 18px;">
          <strong>Pretalk.me</strong> — L'IA au service de votre croissance.<br>
          17 rue Salneuve, 75017 Paris<br>
          Cet email a été envoyé à {{ params.email_client }}.<br>
          <a href="https://pretalk.me/privacy" style="color: #0B996E; text-decoration: underline;">Politique de confidentialité</a> | <a href="https://pretalk.me/contact" style="color: #0B996E; text-decoration: underline;">Contactez-nous</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🗺️ Traductions & Adaptation (Multilingue)

> [!TIP]
> Pour utiliser ce template dans les autres langues (EN, ES, AR), remplacez simplement les blocs de texte tout en conservant la structure `<table>`. Pour la version **Arabe**, n'oubliez pas d'ajouter `dir="rtl"` sur la balise `<html>`.

### Checklist de Validation
1. [ ] **Logo :** Vérifier que l'URL `https://pretalk.me/logo` est accessible.
2. [ ] **Links :** Les liens vers les réseaux sociaux ont été ajoutés dans le footer d'administration.
3. [ ] **Responsive :** Testé sur mobile et desktop (structure Gmail-friendly).
4. [ ] **Branding :** Couleur `#48D951` utilisée pour la barre d'accentuation et `#0B996E` pour le footer.
