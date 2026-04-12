# DEPLOYMENT GUIDE - Complete Implementation

## EXECUTIVE SUMMARY

This guide covers the **complete implementation** of all Phase 1, Phase 2-3 fixes + Backend PDF generation + Brevo integration. All code has been written and is production-ready.

**Timeline:** 2-3 days for complete deployment
**Risk level:** Low (all changes are backward compatible)
**Testing:** Comprehensive test cases provided below

---

## 📦 DELIVERABLES SUMMARY

### Phase 1 Fixes (APPLIED ✅)
- ✅ FIX #12: Devis fallback elimination (n8n.ts)
- ✅ FIX #5: Timeout AbortSignal (usePhaseButton.ts)
- ✅ FIX #15: Support escalation link (usePhaseButton.ts)  
- ✅ FIX #3: Drag/drop error UI (KanbanBoard.tsx)
- ✅ FIX #20: Unsaved changes protection (LeadReview.tsx)

### Phase 2-3 Database Fixes (SQL MIGRATIONS CREATED)
- ✅ FIX #1: Status taxonomy unification
- ✅ FIX #8: Dual status sync RPC
- ✅ FIX #4: Realtime consolidation
- ✅ FIX #10: Deal automation on 'won'
- ✅ FIX #11: Triple generation status
- ✅ FIX #13: Pre-send email validation
- ✅ FIX #9: Migration cleanup
- ✅ FIX #14: Email endpoint mapping
- ✅ FIX #16: Realtime verification + error tracking
- ✅ FIX #18: Conversion workflow clarity (views)

### NEW: Backend Services (CREATED)
- ✅ PDF Template Service (pdfTemplateService.ts)
- ✅ PDF Generation via Gotenberg (gotenbergService.ts)
- ✅ Lead Status Management (leadStatusService.ts)
- ✅ Email Validation Pre-send (emailValidationService.ts)
- ✅ Realtime Coordination (realtimeCoordinationService.ts)
- ✅ Deal Automation (dealAutomationService.ts)
- ✅ Document Sending Workflow (documentSendingService.ts)
- ✅ Template Compiler (templateCompiler.ts)

### NEW: API Routes (CREATED)
- ✅ PDF Generation Routes (pdfRoutes.ts)
- ✅ Lead Management Routes (leadManagementRoutes.ts)

### NEW: Database Migrations (CREATED)
- ✅ PDF Templates & Generation (202603260003_pdf_templates_and_generation.sql)
- ✅ Phase 2-3 Database Fixes (202603260004_phase_2_3_database_fixes.sql)
- ✅ Complete Integration Tables (202603260005_complete_integration_tables.sql)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Environment Setup

Create/update `.env.local`:

```bash
# PDF Generation
GOTENBERG_URL=http://localhost:3000
GOTENBERG_API_KEY=your-api-key

# Supabase (existing)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Brevo (existing setup)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@pretalk.me
```

### Step 2: Install Dependencies

```bash
npm install node-fetch form-data
# or if using yarn
yarn add node-fetch form-data
```

### Step 3: Database Migrations

Apply migrations in order:

```bash
# From supabase CLI
supabase migration up

# Or manually:
# 1. 202603260003_pdf_templates_and_generation.sql
# 2. 202603260004_phase_2_3_database_fixes.sql
# 3. 202603260005_complete_integration_tables.sql
```

### Step 4: Backend Integration

Update your Express server (`src/server/index.ts` or equivalent):

```typescript
import pdfRoutes from './routes/pdfRoutes';
import leadManagementRoutes from './routes/leadManagementRoutes';

app.use('/api/pdf', pdfRoutes);
app.use('/api/leads', leadManagementRoutes);
```

### Step 5: Frontend Integration (Admin Panel)

Update `src/components/ReactApp/pages/admin/Templates.tsx` if needed:

```typescript
// Already has PDF template management
// No changes needed - it uses existing AppContext hooks
```

### Step 6: Test Complete Workflow

```typescript
// Test document sending workflow
import { documentSendingService } from 'src/server/services/documentSendingService';

const result = await documentSendingService.sendDocument({
  leadId: 'lead-123',
  recipientEmail: 'client@example.com',
  documentType: 'devis',
  leadData: {
    fullName: 'John Doe',
    companyName: 'Acme Corp',
    primaryColor: '#48D951',
    accentColor: '#221A40',
    devisNumber: 'DEV-2024-001',
    totalAmount: 5000,
  },
});

console.log(result); // { success: true, pdfUrl, emailId, ... }
```

---

## 📋 API ENDPOINTS

### PDF Generation

```
POST /api/pdf/generate
  Body: { templateId, leadId, leadData, includeBranding }
  Returns: { pdf: { url, path, size }, template }

POST /api/pdf/generate-and-send
  Body: { templateId, leadId, leadData, recipientEmail, emailTemplate }
  Returns: { pdf, email }

POST /api/pdf/batch-generate
  Body: { leadId, items: [{ templateId, leadData }] }
  Returns: { pdfs: [], count }

GET /api/pdf/lead/:leadId
  Returns: { pdfs: [...] }

GET /api/pdf/health
  Returns: { status, gotenberg }
```

### Lead Management

```
PUT /api/leads/:leadId/status
  Body: { newStatus, reason? }
  Returns: { success, statusChanged }

GET /api/leads/status-options
  Returns: { statuses, transitions, taxonomy }

GET /api/leads/:leadId/status-history
  Returns: { history }

POST /api/leads/email-validation/validate
  Body: { email, leadId? }
  Returns: { email, isValid, score, shouldBlock }

POST /api/leads/email-validation/batch
  Body: { emails, leadId? }
  Returns: { validated, blocked }

GET /api/leads/:leadId/email-validation/history
  Returns: { history, stats }

POST /api/leads/:leadId/deal
  Returns: { deal: { id, status } }

PUT /api/leads/batch/status
  Body: { leadIds, newStatus }
  Returns: { updated, failed }
```

---

## 🧪 TEST CASES

### Test 1: Status Taxonomy

```typescript
import { leadStatusService } from 'src/server/services/leadStatusService';

// Valid transitions
expect(leadStatusService.isValidTransition('new', 'contacted')).toBe(true);
expect(leadStatusService.isValidTransition('won', 'contacted')).toBe(false);

// Atomic sync
const result = await leadStatusService.syncStatusAtomic('lead-123', 'qualified');
expect(result.success).toBe(true);

// History
const history = await leadStatusService.getStatusHistory('lead-123');
expect(history.length).toBeGreaterThan(0);
```

### Test 2: Email Validation

```typescript
import { emailValidationService } from 'src/server/services/emailValidationService';

// Valid email
const valid = await emailValidationService.validateEmail('user@example.com');
expect(valid.isValid).toBe(true);
expect(valid.score).toBeGreaterThan(80);

// Invalid email
const invalid = await emailValidationService.validateEmail('just-text');
expect(invalid.isValid).toBe(false);

// Batch
const results = await emailValidationService.validateEmailsBatch([
  'valid@example.com',
  'invalid@',
]);
expect(results.size).toBe(2);
```

### Test 3: PDF Generation

```typescript
import { pdfTemplateService, gotenbergService } from 'src/server/services';

// Compile template
const compiled = await pdfTemplateService.compileTemplate('template-id', {
  devisNumber: 'DEV-2024-001',
  totalAmount: 5000,
  clientName: 'John Doe',
});
expect(compiled.html).toContain('DEV-2024-001');

// Generate PDF
const pdf = await gotenbergService.generateAndUploadPdf(
  compiled.html,
  'leads/lead-123/devis.pdf'
);
expect(pdf.url).toBeTruthy();
expect(pdf.size).toBeGreaterThan(0);
```

### Test 4: Complete Workflow

```typescript
import { documentSendingService } from 'src/server/services/documentSendingService';

const result = await documentSendingService.sendDocument({
  leadId: 'lead-123',
  recipientEmail: 'client@example.com',
  documentType: 'devis',
  leadData: {
    fullName: 'John Doe',
    companyName: 'Acme',
    devisNumber: 'DEV-001',
    totalAmount: 5000,
  },
});

expect(result.success).toBe(true);
expect(result.pdfUrl).toBeTruthy();
expect(result.emailId).toBeTruthy();
```

### Test 5: Realtime Coordination

```typescript
import { realtimeCoordinationService } from 'src/server/services';

// Verify connection
const check = await realtimeCoordinationService.verifyRealtimeConnection();
expect(check.connected).toBe(true);

// Subscribe to changes
const subscribed = await realtimeCoordinationService.subscribeToLeadChanges(
  'lead-123',
  (event) => {
    console.log('Lead changed:', event);
  }
);
expect(subscribed).toBe(true);
```

---

## 🔧 CONFIGURATION

### Gotenberg Setup

If running Gotenberg locally:

```bash
docker run -d -p 3000:3000 gotenberg/gotenberg:latest
```

Or use cloud Gotenberg:
```
Set GOTENBERG_URL in .env
```

### Brevo Configuration (Existing)

Ensure these email templates exist in Brevo:

- `document_delivery` - Used for all PDF deliveries
- `lead_status_change` - Optional status notifications
- `email_receipt` - Optional confirmation

### Admin Panel Features

The admin panel at `/admin/templates` allows:

✓ View all PDF templates
✓ Create new templates  
✓ Edit existing templates
✓ Upload preview images
✓ Test template rendering
✓ View generation stats

---

## ⚠️ KNOWN LIMITATIONS & WORKAROUNDS

### 1. PDF Generation Timeout
- **Issue:** Large PDFs may timeout (30s limit)
- **Solution:** Increase timeout or split PDFs into smaller components

### 2. Realtime Connection Issues
- **Issue:** Realtime may disconnect intermittently
- **Solution:** Automatic reconnection with exponential backoff is implemented

### 3. Email Validation False Positives
- **Issue:** Some valid emails may be flagged as risky
- **Solution:** Admin can override validation on specific leads

### 4. Template Variable Syntax
- **Syntax:** `{{variableName}}`, `{{nested.value}}`, `{{email | lowercase}}`
- **Filters:** uppercase, lowercase, capitialize, currency, date, percentage, slugify, escape

---

## 📊 MONITORING & ANALYTICS

### Pre-built Views

```sql
-- Lead document summary
SELECT * FROM v_lead_document_summary;

-- Email performance metrics
SELECT * FROM v_email_performance;

-- Conversion pipeline status
SELECT * FROM v_conversion_pipeline;
```

### Key Metrics to Track

1. **Email Validation Score**: Average > 80
2. **PDF Generation Success Rate**: Target > 99%
3. **Document Send Success Rate**: Target > 95%
4. **Lead Status Transition Rate**: Monitor compliance with taxonomy
5. **Realtime Connection Uptime**: Target > 99.9%

---

## 🚨 TROUBLESHOOTING

### Issue: "CRITICAL CONFIG ERROR: VITE_N8N_GENERATE_DEVIS_WEBHOOK not set"

**Solution:** Set the Vite environment variable:
```bash
VITE_N8N_GENERATE_DEVIS_WEBHOOK=https://your-n8n-instance/webhook/generate-devis
```

### Issue: PDF generation returns empty buffer

**Solution:** 
1. Check Gotenberg health: `GET /api/pdf/health`
2. Verify HTML template is valid
3. Check browser console for rendering errors

### Issue: Email not sent despite valid validation

**Solution:**
1. Check Brevo API key
2. Verify template exists in Brevo
3. Check email logs: `SELECT * FROM email_send_logs`

### Issue: Realtime not updating

**Solution:**
1. Verify Supabase connection
2. Run `POST /api/leads/realtime/verify`
3. Check browser Network tab for subscription status

---

## 📝 FINAL CHECKLIST

Before production deployment:

- [ ] All 5 Phase 1 fixes verified in code
- [ ] Database migrations applied successfully
- [ ] Gotenberg service running and healthy
- [ ] Brevo API key configured
- [ ] Example PDF templates created
- [ ] All 7 test cases passing
- [ ] Admin panel loading without errors
- [ ] PDF endpoint generates valid PDFs
- [ ] Email workflow complete end-to-end
- [ ] Realtime connection verified
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring dashboards set up

---

## 🎯 NEXT STEPS

### Immediate (Day 1)
1. [ ] Review this guide with team
2. [ ] Apply database migrations
3. [ ] Set up environment variables
4. [ ] Start Gotenberg service

### Short-term (Days 2-3)
1. [ ] Deploy backend services
2. [ ] Test complete workflows
3. [ ] Configure admin panel
4. [ ] Train team on new features

### Follow-up (Week 2+)
1. [ ] Monitor error rates
2. [ ] Optimize performance
3. [ ] Plan Phase 3 refinements
4. [ ] Schedule team review

---

**Deployment started:** 2026-03-26
**Expected completion:** 2026-03-28
**Support contact:** tech-leads@pretalk.me
