# Pretalk.me - Final Branded Email Templates (Supabase Auth)

These templates use the official Pretalk logo image and follow our premium brand guidelines. All templates are designed for a direct-to-inbox feel (no cards/shadows) and are fully responsive.

---

### Brand Assets
- **Logo URL:** `https://pretalk.me/logo`
- **Primary Color:** `#48D951` (Green)
- **Secondary Color:** `#221A40` (Deep Purple)

---

### 1. Confirm Your Signup
**Subject:** Welcome! Please confirm your email at Pretalk

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <!-- Clickable Image Logo -->
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">Welcome to Pretalk!</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      We're excited to have you on board! To get started with your AI-powered consultancy workspace, please confirm your email address by clicking the button below.
    </p>

    <div style="margin-bottom: 32px;">
      <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Confirm Email</a>
    </div>

    <hr style="border: none; border-top: 1px solid #E8E8E8; margin-bottom: 24px;">
    
    <p style="font-size: 13px; color: #9A9A9A; line-height: 18px;">
      If you did not create an account on <a href="{{ .SiteURL }}" style="color: #48D951; text-decoration: none;">Pretalk.me</a>, please ignore this email.
    </p>

    <p style="font-size: 13px; color: #9A9A9A; margin-top: 20px;">
      Best regards,<br>
      The Pretalk Team
    </p>
  </div>
</body>
</html>
```

---

### 2. You Have Been Invited
**Subject:** You've been invited to join Pretalk

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">You are invited</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      You have been invited to collaborate on <a href="{{ .SiteURL }}" style="color: #48D951; text-decoration: none;">{{ .SiteURL }}</a>. Follow the link below to accept the invitation and set up your profile.
    </p>

    <div style="margin-bottom: 32px;">
      <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Accept Invitation</a>
    </div>

    <p style="font-size: 13px; color: #9A9A9A;">
      Pretalk.me - 17 rue Salneuve, 75017 PARIS
    </p>
  </div>
</body>
</html>
```

---

### 3. Your Magic Link
**Subject:** Log in to Pretalk

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">Your Magic Link</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      No password needed. Click the button below to sign in instantly to your Pretalk workspace.
    </p>

    <div style="margin-bottom: 32px;">
      <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Log In to Dashboard</a>
    </div>

    <p style="font-size: 13px; color: #9A9A9A;">
      This link is for your eyes only and will expire soon.
    </p>
  </div>
</body>
</html>
```

---

### 4. Confirm Email Change
**Subject:** Confirm your email change

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">Confirm Email Change</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      You're almost there. Please confirm that you want to change your email from <strong>{{ .Email }}</strong> to your new address by clicking below.
    </p>

    <div style="margin-bottom: 32px;">
      <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Confirm Change</a>
    </div>
  </div>
</body>
</html>
```

---

### 5. Reset Your Password
**Subject:** Reset your Pretalk password

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">Reset Password</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Forgot your password? It happens. Click the button below to set a new one and get back to your dashboard.
    </p>

    <div style="margin-bottom: 32px;">
      <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #48D951; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Set New Password</a>
    </div>

    <p style="font-size: 13px; color: #9A9A9A;">
      If you didn't request this change, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
```

---

### 6. Confirm Reauthentication
**Subject:** Your security verification code

```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: sans-serif; color: #3D3D3D;">
  <div style="max-width: 600px;">
    <div style="margin-bottom: 32px;">
      <a href="{{ .SiteURL }}" style="text-decoration: none;">
        <img src="https://pretalk.me/logo" alt="Pretalk.me" style="height: 40px; width: auto; border: 0; display: block;">
      </a>
    </div>

    <h1 style="font-size: 22px; color: #221A40; margin-bottom: 20px;">Security Verification</h1>
    
    <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
      Please use the following code to complete your verification. This code will expire in 10 minutes.
    </p>

    <div style="background-color: #F4F4F4; border-radius: 12px; padding: 24px; text-align: left; font-size: 28px; font-weight: 800; color: #221A40; letter-spacing: 4px; margin-bottom: 32px;">
      {{ .Token }}
    </div>

    <p style="font-size: 13px; color: #9A9A9A;">
      For your security, do not share this code with anyone.
    </p>
  </div>
</body>
</html>
```
