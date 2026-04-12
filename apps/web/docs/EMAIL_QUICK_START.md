# ⚡ QUICK START - Email Backend (Local Testing)

## 4 Steps to Get Emails Working Locally

### Step 1: Supabase - Run SQL Migration (2 min)

1. Go to: https://app.supabase.com
2. Click: SQL Editor (left sidebar)
3. Click: New Query
4. Copy-paste ALL the SQL from this file: `supabase/migrations/email_send_logs_table.sql`
5. Click: Run

**Expected:**
- No errors
- New table `email_send_logs` created with indexes

---

### Step 2: Backend - Register Test Endpoint (3 min)

Find your main server file: `src/server/index.ts` (or `server.ts`)

Add at the top:
```typescript
import emailTestRouter from './routes/emailTestRoutes.js';
```

Add AFTER all existing middleware (around line 50-100):
```typescript
// Email endpoints
app.use('/api/email', emailTestRouter);  // Testing endpoints (localhost)
app.use('/api/email', emailRoutes);      // Production endpoints
```

**Verify:** File saved ✅

---

### Step 3: Test Backend (2 min)

**Terminal 1 - Start backend:**
```bash
cd c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub
npm run dev
# Wait for: "[Astro] Server started at http://localhost:3000"
```

**Terminal 2 - Test health check:**
```bash
curl http://localhost:8787/api/email/health
```

**Expected Response:**
```json
{"status":"ok","service":"email-test-endpoint","timestamp":"2026-03-26T10:30:00Z"}
```

---

### Step 4: Send First Test Email (2 min)

**Terminal 2 - Send test email:**
```bash
curl -X POST http://localhost:8787/api/email/test `
  -H "Content-Type: application/json" `
  -d @- << 'EOF'
{
  "event_type": "delivery_audit",
  "recipient_email": "your-real-email@gmail.com",
  "locale": "fr",
  "template_params": {
    "nom_client": "Test Client",
    "nom_consultant": "Test Consultant",
    "audit_url": "https://pretalk.me/audit/123",
    "audit_summary": "Excellent potential"
  }
}
EOF
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "event_type": "delivery_audit",
  "recipient_email": "your-real-email@gmail.com",
  "locale": "fr",
  "message_id": "email-id-xxx",
  "timestamp": "2026-03-26T10:30:15Z"
}
```

**Check your inbox** - You should receive the email! 📧

---

## 🔧 PowerShell Script Version

If you prefer running from PowerShell:

```powershell
# 1. Start backend
cd c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub
npm run dev

# 2. In another PowerShell window, test health
$response = Invoke-WebRequest -Uri 'http://localhost:8787/api/email/health'
$response.Content

# 3. Send test email
$emailPayload = @{
    event_type = "delivery_audit"
    recipient_email = "your-email@gmail.com"
    locale = "fr"
    template_params = @{
        nom_client = "Test Client"
        nom_consultant = "Jane Smith"
        audit_url = "https://pretalk.me/audit/123"
        audit_summary = "Strong strategic fit"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri 'http://localhost:8787/api/email/test' `
  -Method POST `
  -Headers @{ 'Content-Type' = 'application/json' } `
  -Body $emailPayload

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## ✅ Verification Checklist

- [ ] Supabase SQL executed without errors
- [ ] `email_send_logs` table exists in Supabase
- [ ] emailTestRoutes imported in server
- [ ] Backend starts without errors
- [ ] `/api/email/health` returns 200 OK
- [ ] `/api/email/test` returns 200 OK
- [ ] Email received in inbox ✅

---

## 📋 Next: Frontend Wiring (when ready)

Once backend testing works:
1. Edit `src/components/ReactApp/lib/leadActions.ts`
2. Add email sending to qualification/rejection/review functions
3. Wire n8n Lead Actions to use backend email endpoint (Option B)

See: `docs/EMAIL_BACKEND_IMPLEMENTATION_GUIDE.md` for details

---

## ⚠️ Troubleshooting

### Q: "BREVO_API_KEY not found"
**A:** Check `.env.local` has the real API key (not placeholder)

### Q: "POST /api/email/test 404"
**A:** emailTestRoutes not imported in server. Check Step 2.

### Q: "Connection refused on 8787"
**A:** Backend not running. Run `npm run dev` in Terminal 1

### Q: Email not received
**A:** Check:
1. Recipient email is correct
2. Check spam folder
3. Check Brevo dashboard for bounce/error logs

---

**Total time: ~10 minutes** ⏱️
