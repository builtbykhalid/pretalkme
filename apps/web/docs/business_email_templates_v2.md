# Pretalk.me - Proprietary Business Email Templates (Multi-language)

Ce document contient les versions HTML finalisées pour les deux emails propriétaires (Lead Notification et Audit Delivery) déclinés en 4 langues (FR, EN, ES, AR).

### Paramètres de Design
- **Header :** Logo Pretalk cliquable.
- **Footer :** Liens sociaux, Mentions légales (17 rue Salneuve, 75017 PARIS).
- **Style :** Premium Minimalist, typographie système, pas d'ombres portées.
- **Contrainte :** Maximum 1 emoji par email.

---

## 1. Notification Nouveau Lead (Pour le Consultant)
*Déclenché lorsqu'un diagnostic est complété et qualifié par l'IA.*

<details>
<summary>🇫🇷 Français</summary>

**Sujet :** Bonne nouvelle ! Nouveau prospect qualifié sur Pretalk

```html
<!DOCTYPE html>
<html lang="fr">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="margin-bottom: 40px;">
      <a href="https://pretalk.me" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto; border: 0;">
      </a>
    </div>

    <!-- Content -->
    <h1 style="font-size: 24px; color: #221A40; margin-bottom: 24px; font-weight: 700;">Excellente nouvelle {{ params.nom_consultant }} !</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Votre diagnostic interactif vient de qualifier un nouveau prospect à fort potentiel.
    </p>

    <div style="background-color: #F8F9FA; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;"><strong>Client :</strong> {{ params.nom_client }}</p>
      <p style="margin: 0; font-size: 16px;"><strong>Score de maturité :</strong> {{ params.score_ia }}/100</p>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Connectez-vous à votre espace de travail pour valider l'audit et engager la discussion :
    </p>

    <div style="margin-bottom: 48px;">
      <a href="https://pretalk.me/app/leads/{{ params.lead_id }}" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">🔥 Voir le Lead</a>
    </div>

    <!-- Footer -->
    <hr style="border: none; border-top: 1px solid #EEEEEE; margin-bottom: 32px;">
    <div style="font-size: 13px; color: #9A9A9A; line-height: 20px;">
      <p style="margin-bottom: 8px;"><strong>Pretalk.me</strong> — L'IA au service de votre croissance.</p>
      <p style="margin-bottom: 16px;">17 rue Salneuve, 75017 PARIS</p>
      <div style="margin-bottom: 16px;">
        <a href="https://linkedin.com/company/pretalk" style="color: #221A40; text-decoration: none; margin-right: 15px;">LinkedIn</a>
        <a href="https://twitter.com/pretalk" style="color: #221A40; text-decoration: none;">Twitter</a>
      </div>
      <p style="font-size: 11px;">Vous recevez cet email car un diagnostic a été complété sur votre compte Pretalk.</p>
    </div>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇺🇸 English</summary>

**Subject:** Great news! New qualified prospect on Pretalk

```html
<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px;">
      <a href="https://pretalk.me" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto; border: 0;">
      </a>
    </div>

    <h1 style="font-size: 24px; color: #221A40; margin-bottom: 24px; font-weight: 700;">Great news {{ params.nom_consultant }}!</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Your interactive diagnostic has just qualified a hot new prospect.
    </p>

    <div style="background-color: #F8F9FA; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;"><strong>Client:</strong> {{ params.nom_client }}</p>
      <p style="margin: 0; font-size: 16px;"><strong>Maturity score:</strong> {{ params.score_ia }}/100</p>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Log in to your workspace to validate the audit and start the conversation:
    </p>

    <div style="margin-bottom: 48px;">
      <a href="https://pretalk.me/app/leads/{{ params.lead_id }}" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">🔥 View Lead</a>
    </div>

    <hr style="border: none; border-top: 1px solid #EEEEEE; margin-bottom: 32px;">
    <div style="font-size: 13px; color: #9A9A9A; line-height: 20px;">
      <p style="margin-bottom: 8px;"><strong>Pretalk.me</strong> — AI-powered growth.</p>
      <p style="margin-bottom: 16px;">17 rue Salneuve, 75017 PARIS</p>
      <div style="margin-bottom: 16px;">
        <a href="https://linkedin.com/company/pretalk" style="color: #221A40; text-decoration: none; margin-right: 15px;">LinkedIn</a>
        <a href="https://twitter.com/pretalk" style="color: #221A40; text-decoration: none;">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇪🇸 Español</summary>

**Subject:** ¡Buenas noticias! Nuevo prospecto calificado en Pretalk

```html
<!DOCTYPE html>
<html lang="es">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px;">
      <a href="https://pretalk.me" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto; border: 0;">
      </a>
    </div>

    <h1 style="font-size: 24px; color: #221A40; margin-bottom: 24px; font-weight: 700;">¡Buenas noticias {{ params.nom_consultant }}!</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Tu diagnóstico interactivo acaba de calificar a un nuevo prospecto con gran potencial.
    </p>

    <div style="background-color: #F8F9FA; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;"><strong>Cliente:</strong> {{ params.nom_client }}</p>
      <p style="margin: 0; font-size: 16px;"><strong>Puntaje de madurez:</strong> {{ params.score_ia }}/100</p>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      Inicia sesión en tu espacio de trabajo para validar la auditoría y comenzar la conversación:
    </p>

    <div style="margin-bottom: 48px;">
      <a href="https://pretalk.me/app/leads/{{ params.lead_id }}" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">🔥 Ver el Lead</a>
    </div>

    <hr style="border: none; border-top: 1px solid #EEEEEE; margin-bottom: 32px;">
    <div style="font-size: 13px; color: #9A9A9A; line-height: 20px;">
      <p style="margin-bottom: 8px;"><strong>Pretalk.me</strong> — El poder de la IA para tu crecimiento.</p>
    </div>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇸🇦 العربية</summary>

**Subject:** أخبار رائعة! عميل محتمل جديد مؤهل على Pretalk

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #3D3D3D; text-align: right;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px; text-align: right;">
      <a href="https://pretalk.me" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto; border: 0;">
      </a>
    </div>

    <h1 style="font-size: 24px; color: #221A40; margin-bottom: 24px; font-weight: 700;">أخبار رائعة {{ params.nom_consultant }}!</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      لقد قام تشخيصك التفاعلي للتو بتأهيل عميل محتمل جديد ومهتم جداً.
    </p>

    <div style="background-color: #F8F9FA; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 12px 0; font-size: 16px;"><strong>العميل:</strong> {{ params.nom_client }}</p>
      <p style="margin: 0; font-size: 16px;"><strong>درجة النضج:</strong> {{ params.score_ia }}/100</p>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      سجل الدخول إلى مساحة عملك للتحقق من التقرير وبدء المناقشة:
    </p>

    <div style="margin-bottom: 48px;">
      <a href="https://pretalk.me/app/leads/{{ params.lead_id }}" target="_blank" style="display: inline-block; padding: 16px 32px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">🔥 عرض العميل</a>
    </div>

    <hr style="border: none; border-top: 1px solid #EEEEEE; margin-bottom: 32px;">
    <div style="font-size: 13px; color: #9A9A9A; line-height: 20px;">
      <p style="margin-bottom: 8px;"><strong>Pretalk.me</strong> — الذكاء الاصطناعي في خدمة نموك.</p>
    </div>
  </div>
</body>
</html>
```
</details>

---

## 2. Livraison de l'Audit (Pour le Client)
*Envoyé au client final avec son diagnostic personnalisé.*

<details>
<summary>🇫🇷 Français</summary>

**Sujet :** Votre diagnostic stratégique personnalisé est prêt

```html
<!DOCTYPE html>
<html lang="fr">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="margin-bottom: 40px;">
      <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto;">
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">Bonjour {{ params.nom_client }},</p>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Merci d'avoir pris le temps de m'en dire plus sur vos objectifs et vos défis actuels.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      J'ai analysé vos réponses avec soin. Comme convenu, j'ai synthétisé mes observations dans un diagnostic stratégique sur-mesure que vous découvrirez en pièce jointe.
    </p>

    <div style="background-color: #F8F9FA; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="margin: 0 0 10px 0;">• Vos points forts actuels.</p>
      <p style="margin: 0 0 10px 0;">• Les zones d'ombre qui freinent votre croissance.</p>
      <p style="margin: 0;">• Mes recommandations prioritaires.</p>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      {{ params.custom_content }}
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px; font-weight: 600; color: #221A40;">
      La prochaine étape ? Transformer ce constat en un plan d'action concret.
    </p>

    <div style="margin-bottom: 48px;">
      <p style="margin-bottom: 16px;">Choisissez un créneau dans mon agenda (15-20 min) :</p>
      <a href="{{ params.booking_link }}" style="display: inline-block; padding: 16px 32px; background-color: #221A40; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">📅 Réserver un débriefing</a>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 40px;">
      Au plaisir d'échanger avec vous,<br>
      <strong>{{ params.nom_consultant }}</strong>
    </p>

    <!-- Footer -->
    <hr style="border: none; border-top: 1px solid #EEEEEE; margin-bottom: 24px;">
    <p style="font-size: 12px; color: #9A9A9A; text-align: center;">Propulsé par Pretalk.me — 17 rue Salneuve, 75017 PARIS</p>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇺🇸 English</summary>

**Subject:** Your personalized strategic diagnostic is ready

```html
<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px;">
      <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto;">
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hi {{ params.nom_client }},</p>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Thank you for taking the time to share your goals and current challenges with me.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      I have carefully analyzed your responses and synthesized my findings in the attached strategic diagnostic.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      {{ params.custom_content }}
    </p>

    <div style="margin-bottom: 48px;">
      <p style="margin-bottom: 16px;">Pick a slot in my calendar for a brief discussion (15-20 min):</p>
      <a href="{{ params.booking_link }}" style="display: inline-block; padding: 16px 32px; background-color: #221A40; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">📅 Book a debrief session</a>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 40px;">
      Best regards,<br>
      <strong>{{ params.nom_consultant }}</strong>
    </p>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇪🇸 Español</summary>

**Subject:** Tu diagnóstico estratégico personalizado está listo

```html
<!DOCTYPE html>
<html lang="es">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #3D3D3D;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px;">
      <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto;">
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hola {{ params.nom_client }},</p>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Gracias por tomarte el tiempo de contarme más sobre tus objetivos y desafíos actuales.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      He analizado tus respuestas con cuidado y he sintetizado mis observaciones en el diagnóstico estratégico adjunto.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      {{ params.custom_content }}
    </p>

    <div style="margin-bottom: 48px;">
      <p style="margin-bottom: 16px;">Elige un horario en mi agenda para hablar (15-20 min):</p>
      <a href="{{ params.booking_link }}" style="display: inline-block; padding: 16px 32px; background-color: #221A40; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">📅 Reservar una sesión</a>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 40px;">
      Un placer saludarte,<br>
      <strong>{{ params.nom_consultant }}</strong>
    </p>
  </div>
</body>
</html>
```
</details>

<details>
<summary>🇸🇦 العربية</summary>

**Subject:** تشخيصك الاستراتيجي المخصص جاهز

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #3D3D3D; text-align: right;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="margin-bottom: 40px;">
      <img src="https://pretalk.me/logo" alt="Pretalk" style="height: 32px; width: auto;">
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">مرحباً {{ params.nom_client }}،</p>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      شكراً لتخصيص الوقت لإطلاعي على أهدافك وتحدياتك الحالية.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 32px;">
      لقد قمت بتحليل إجاباتك بعناية ولخصت ملاحظاتي في التشخيص الاستراتيجي المرفق.
    </p>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      {{ params.custom_content }}
    </p>

    <div style="margin-bottom: 48px;">
      <p style="margin-bottom: 16px;">اختر موعداً في جدول مواعيدي للنقاش (15-20 دقيقة):</p>
      <a href="{{ params.booking_link }}" style="display: inline-block; padding: 16px 32px; background-color: #221A40; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">📅 حجز جلسة نقاش</a>
    </div>

    <p style="font-size: 16px; line-height: 24px; margin-bottom: 40px;">
      مع أطيب التحيات،<br>
      <strong>{{ params.nom_consultant }}</strong>
    </p>
  </div>
</body>
</html>
```
</details>
