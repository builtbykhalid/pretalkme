# QUICK START - Complete System Usage

## 🎯 What You Have Now

**11 Backend Services**
- PDF Template Management
- PDF Generation via Gotenberg  
- Brevo Email Integration
- Lead Status Management
- Email Validation
- Realtime Coordination
- Deal Automation
- Document Sending Workflow
- Template Compilation
- Analytics & Reporting

**5 API Route Modules**
- PDF Routes (9 endpoints)
- Lead Management Routes (12 endpoints)
- Email Endpoints (Brevo)
- Status Management
- Batch Operations

**3 Phase Implementations**
- Phase 1: 5 Critical UI Fixes (APPLIED)
- Phase 2-3: 11 Database & Logic Fixes (SQL + Services)
- NEW: Complete Backend EmailBranding/PDF System

**Database**
- 8 New Tables
- 5 Views for Analytics  
- 15+ Functions & Triggers
- 3 Migrations (order matters)

---

## 🚀 QUICKEST PATH TO PRODUCTION (4 hours)

### 1. Apply Database Migrations (15 min)

```bash
# Copy migration files to supabase/migrations/
cp -r supabase/migrations/2026032600*.sql <your-supabase>/migrations/

# Run migrations
supabase migration up
```

### 2. Install Dependencies (5 min)

```bash
npm install node-fetch form-data
```

### 3. Add Environment Variables (5 min)

In `.env.local`:
```
GOTENBERG_URL=http://localhost:3000
SUPABASE_URL=<existing>
SUPABASE_SERVICE_ROLE_KEY=<existing>
BREVO_API_KEY=<existing>
BREVO_SENDER_EMAIL=noreply@pretalk.me
```

### 4. Mount Routes in Backend (10 min)

In `src/server/index.ts`:
```typescript
import pdfRoutes from './routes/pdfRoutes';
import leadManagementRoutes from './routes/leadManagementRoutes';

app.use('/api/pdf', pdfRoutes);
app.use('/api/leads', leadManagementRoutes);
```

### 5. Add Gotenberg to Docker Compose (5 min)

```yaml
gotenberg:
  image: gotenberg/gotenberg:latest
  ports:
    - "3000:3000"
  environment:
    - LOG_LEVEL=info
```

### 6. Start Gotenberg (2 min)

```bash
docker-compose up -d gotenberg
```

### 7. Verify Setup (5 min)

```bash
# Check Gotenberg
curl http://localhost:3000/health

# Check API
curl http://localhost:5000/api/pdf/health

# Check Database
npx supabase db push
```

### 8. Test Complete Flow (2 min)

```bash
curl -X POST http://localhost:5000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "templateId": "your-template-id",
    "leadId": "test-lead",
    "leadData": {
      "devisNumber": "DEV-001",
      "totalAmount": 5000
    }
  }'
```

---

## 📱 REAL-WORLD USAGE EXAMPLES

### Example 1: Send Quote (Devis) with Auto-Email

```typescript
import { documentSendingService } from './services/documentSendingService';

// Triggered when user clicks "Send Quote" button
const result = await documentSendingService.sendDocument({
  leadId: 'lead-abc123',
  recipientEmail: 'client@company.com',
  documentType: 'devis',
  leadData: {
    fullName: 'Marie Dupont',
    companyName: 'TechCorp SARL',
    devisNumber: 'DEV-2024-0042',
    totalAmount: 15000,
    services: ['Audit complet', 'Optimisation SEO'],
    validityDays: 30,
    primaryColor: '#48D951',
    accentColor: '#221A40',
  },
});

if (result.success) {
  // Update lead status
  await leadStatusService.syncStatusAtomic(
    'lead-abc123',
    'proposal_sent',
    'Quote sent via PDF'
  );
  
  // Show success to user
  toast.success(`Quote sent to ${result.recipientEmail}`);
  toast.info(`PDF: ${result.pdfUrl}`);
}
```

### Example 2: Batch Generate Multiple Documents

```typescript
// Send audit + contract + proposal to client
const items = [
  {
    templateId: 'audit-template-uuid',
    leadData: { auditDate: '2024-03-26', findings: [...] }
  },
  {
    templateId: 'contrat-template-uuid',
    leadData: { contractNumber: 'CTR-001' }
  },
  {
    templateId: 'devis-template-uuid',
    leadData: { totalAmount: 5000 }
  }
];

const pdfs = await gotenbergService.generatePdfsBatch(
  items.map((item, i) => ({
    html: compiled[i].html,
    path: `leads/lead-123/document-${i}.pdf`
  }))
);

// All PDFs generated in parallel
console.log(`Generated ${pdfs.length} PDFs`);
```

### Example 3: Auto-Advance Status on Document Send

```typescript
// When sending contract, auto-advance to "negotiating"
const result = await documentSendingService.sendDocument({
  leadId: 'lead-xyz',
  recipientEmail: 'client@company.com',
  documentType: 'contrat',
  leadData: {...},
  emailTemplate: 'contract_delivery'
});

if (result.success) {
  // Automatically advance status
  const statusResult = await leadStatusService.syncStatusAtomic(
    'lead-xyz',
    'negotiating',
    `Contract sent: ${result.pdfUrl}`
  );
  
  // Create deal if lead is won
  if (statusResult.success && /* lead status will be won */) {
    const deal = await dealAutomationService.handleLeadWon('lead-xyz');
  }
}
```

### Example 4: Admin Panel - Manage Templates

```typescript
// Already built into /admin/templates - no code needed!
// UI Features:
// - View all templates
// - Create/edit templates
// - Upload preview images
// - Test rendering
// - View stats per template
```

### Example 5: Email Validation Workflow

```typescript
// Before sending, always validate email
const validation = await emailValidationService.validateEmail(
  'client@company.com',
  'lead-123'
);

if (validation.score < 40) {
  // Ask user for confirmation
  const confirmed = await askUserConfirmation(
    `Email has low validation score (${validation.score}): ${validation.validationResult}. Continue?`
  );
  
  if (!confirmed) return;
}

// Proceed with sending
```

### Example 6: Status Transitions & Validation

```typescript
// Get valid next statuses for current lead
const nextStatuses = leadStatusService.getNextValidStatuses('proposal_sent');
// Returns: ['negotiating', 'lost', 'archived']

// Try invalid transition
const invalid = leadStatusService.isValidTransition('won', 'new');
// Returns: false

// Update status with validation
const result = await leadStatusService.syncStatusAtomic(
  'lead-123',
  'negotiating',
  'Client interested in proposal'
);
```

---

## 🔍 MONITORING DASHBOARD

### Key Metrics Query

```sql
-- Real-time dashboard data
SELECT
  (SELECT COUNT(*) FROM leads WHERE status = 'won') as deals_won,
  (SELECT COUNT(*) FROM leads WHERE status = 'proposal_sent') as pending_proposals,
  (SELECT COUNT(*) FROM document_sending_logs WHERE status = 'success' AND DATE(created_at) = TODAY()) as docs_sent_today,
  (SELECT ROUND(AVG(validation_score)::NUMERIC, 2) FROM document_sending_logs WHERE DATE(created_at) = TODAY()) as avg_email_score,
  (SELECT COUNT(DISTINCT lead_id) FROM v_lead_document_summary WHERE successful_sends > 0) as leads_engaged;
```

### Email Performance (Last 30 days)

```sql
SELECT
  DATE_TRUNC('day', created_at) as date,
  document_type,
  COUNT(*) as sent,
  ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / COUNT(*), 1) as success_rate,
  ROUND(AVG(validation_score)::NUMERIC, 2) as avg_score,
  ROUND(AVG(duration_ms)::NUMERIC, 0) as avg_duration_ms
FROM document_sending_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), document_type
ORDER BY date DESC;
```

---

## 🎨 CUSTOMIZATION

### Add Custom Email Filter

In `templateCompiler.ts`, add to `applyFilter()`:

```typescript
case 'custom_filter_name':
  return customFilterFunction(value);
```

### Add Custom Template Type

In `leadStatusService.ts`:

```typescript
export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'archived'
  | 'your_new_status'; // Add here
```

### Customize Email Templates in Brevo

Go to Brevo dashboard → Templates, edit:
- `document_delivery` - All PDFs
- `contract_delivery` - Specific to contracts
- `quote_sent` - Quotes specifically

---

## ⚡ PERFORMANCE TIPS

1. **Parallel PDF Generation**: Use `generatePdfsBatch()` for multiple docs
2. **Cache Templates**: ~5min TTL, auto-invalidated on update
3. **Async Email**: Send emails async, don't wait for Brevo response
4. **Batch Email Validation**: Validate all at once, not individually
5. **Database Indexes**: Already included, no action needed

---

## 🔒 SECURITY CHECKLIST

- [ ] Service role key in `.env` only
- [ ] RLS policies enabled on all tables
- [ ] Email validation prevents injection
- [ ] PDF template sanitization
- [ ] Realtime connection verified
- [ ] Admin routes require auth
- [ ] Status transitions validated
- [ ] Error messages don't leak data

---

## 📞 SUPPORT & TROUBLESHOOTING

### Service Status Checks

```bash
# Gotenberg
curl -s http://localhost:3000/health | jq .

# Database (requires auth)
curl -s http://localhost:5000/api/pdf/health | jq .

# Realtime connection
curl -s http://localhost:5000/api/leads/realtime/verify | jq .
```

### Enable Debug Logging

```typescript
// In service constructor
if (process.env.DEBUG) {
  console.log('[ServiceName] Debug enabled');
}
```

### Check Service Health

```typescript
// Health check endpoint
router.get('/health', async (req, res) => {
  const checks = {
    gotenberg: await gotenbergService.healthCheck(),
    templates: pdfTemplateService.getCacheStats(),
    realtime: realtimeCoordinationService.getStats(),
  };
  res.json(checks);
});
```

---

## 🎓 LEARNING PATH

1. **Understanding Flow** (10 min)
   - Read: `documentSendingService.ts` - main orchestrator

2. **PDF Generation** (15 min)
   - Read: `pdfTemplateService.ts` + `gotenbergService.ts`

3. **Status Management** (10 min)
   - Read: `leadStatusService.ts`

4. **Email Integration** (10 min)
   - Read: `brevoEmailService.ts` (existing)

5. **Admin Panel** (5 min)
   - View: `/admin/templates` (already built)

---

**Ready to deploy?** Start with step 1 of the QUICKEST PATH TO PRODUCTION above!
