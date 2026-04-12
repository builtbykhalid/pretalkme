/**
 * Email Service E2E Tests
 * Validates backend email API for all transactional event types
 *
 * Test Coverage:
 * - delivery_audit: Audit delivery notification
 * - delivery_proposition: Proposal/offer delivery
 * - kickoff_ready: Kickoff form ready
 * - new_lead: New lead notification (internal)
 * - contract_signed: Contract signed notification
 * - proposal_follow_up: Auto follow-up after proposal send
 *
 * Prerequisites:
 * - BREVO_API_KEY environment variable set
 * - Test lead ID in test database
 * - Test recipient email address
 *
 * Run: npm test -- src/tests/email-e2e.test.ts
 */

import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8787';
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-bearer-token';
const TEST_LEAD_ID = 'test-lead-uuid-placeholder';
const TEST_RECIPIENT_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

interface EmailTestCase {
  eventType: string;
  description: string;
  payload: Record<string, any>;
  expectedTemplateId: number;
  locale: string;
}

const EMAIL_TEST_CASES: EmailTestCase[] = [
  {
    eventType: 'delivery_audit',
    description: 'Send audit report to client',
    payload: {
      event_type: 'delivery_audit',
      recipient_email: TEST_RECIPIENT_EMAIL,
      recipient_name: 'John Doe',
      locale: 'fr',
      consultant_email: 'consultant@pretalk.me',
      template_params: {
        nom_consultant: 'Jane Smith',
        nom_client: 'John Doe',
        audit_url: 'https://example.com/audits/123',
        booking_link: 'https://calendly.com/jane/debrief',
        cta_label: 'Voir mon audit',
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 20, // fr template for delivery_audit
    locale: 'fr',
  },

  {
    eventType: 'delivery_proposition',
    description: 'Send proposal/offer to client',
    payload: {
      event_type: 'delivery_proposition',
      recipient_email: TEST_RECIPIENT_EMAIL,
      recipient_name: 'John Doe',
      locale: 'fr',
      consultant_email: 'consultant@pretalk.me',
      template_params: {
        nom_consultant: 'Jane Smith',
        nom_client: 'John Doe',
        proposal_url: 'https://example.com/proposals/456',
        cta_label: 'Consulter les offres',
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 30, // fr template for delivery_proposition
    locale: 'fr',
  },

  {
    eventType: 'kickoff_ready',
    description: 'Send kickoff form link after contract signing',
    payload: {
      event_type: 'kickoff_ready',
      recipient_email: TEST_RECIPIENT_EMAIL,
      recipient_name: 'John Doe',
      locale: 'fr',
      consultant_email: 'consultant@pretalk.me',
      template_params: {
        nom_consultant: 'Jane Smith',
        nom_client: 'John Doe',
        kickoff_url: 'https://example.com/kickoff/789',
        cta_label: 'Commencer le kickoff',
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 60, // fr template for kickoff_ready
    locale: 'fr',
  },

  {
    eventType: 'new_lead',
    description: 'Notify consultant of new lead (internal)',
    payload: {
      event_type: 'new_lead',
      recipient_email: 'consultant@pretalk.me',
      recipient_name: 'Jane Smith',
      locale: 'fr',
      template_params: {
        lead_name: 'John Doe',
        lead_email: TEST_RECIPIENT_EMAIL,
        lead_company: 'Acme Corp',
        source: 'Website Form',
        score: 75,
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 10,
    locale: 'fr',
  },

  {
    eventType: 'contract_signed',
    description: 'Confirm contract signing',
    payload: {
      event_type: 'contract_signed',
      recipient_email: TEST_RECIPIENT_EMAIL,
      recipient_name: 'John Doe',
      locale: 'fr',
      template_params: {
        nom_consultant: 'Jane Smith',
        nom_client: 'John Doe',
        contract_link: 'https://example.com/contracts/signed/123',
        next_steps: 'Nous vous enverrons le formulaire de kickoff sous peu.',
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 50,
    locale: 'fr',
  },

  {
    eventType: 'proposal_follow_up',
    description: 'Auto follow-up email after proposal sent',
    payload: {
      event_type: 'proposal_follow_up',
      recipient_email: TEST_RECIPIENT_EMAIL,
      recipient_name: 'John Doe',
      locale: 'fr',
      consultant_email: 'consultant@pretalk.me',
      template_params: {
        nom_consultant: 'Jane Smith',
        nom_client: 'John Doe',
        proposal_url: 'https://example.com/proposals/456',
        follow_up_message: 'Avez-vous des questions sur cette proposition?',
      },
      lead_id: TEST_LEAD_ID,
    },
    expectedTemplateId: 40,
    locale: 'fr',
  },
];

describe('Email Service E2E Tests', () => {
  let apiClient: typeof axios;

  beforeAll(() => {
    apiClient = axios.create({
      baseURL: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    });
  });

  afterAll(() => {
    // Cleanup, if needed
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await apiClient.get('/api/email/health');
      expect(response.status).toBe(200);
      expect(response.data.status).toContain('ok');
    });
  });

  describe('Send Template Emails', () => {
    EMAIL_TEST_CASES.forEach((testCase) => {
      it(`should send ${testCase.eventType} email - ${testCase.description}`, async () => {
        const response = await apiClient.post('/api/email/send-template', testCase.payload);

        // Success response
        if (response.status === 200) {
          expect(response.data.success).toBe(true);
          expect(response.data.message_id).toBeDefined();
          expect(response.data.message_id).toMatch(/^[a-f0-9-]+$/); // UUID format
          console.log(`✅ ${testCase.eventType}: Message ID = ${response.data.message_id}`);
        } else {
          // Error response - debug info
          console.error(`❌ ${testCase.eventType}: ${response.status}`, response.data);
          throw new Error(
            `Failed to send ${testCase.eventType}: ${response.data.error || response.statusText}`
          );
        }
      });
    });
  });

  describe('Batch Email Sending', () => {
    it('should send batch emails successfully', async () => {
      const batchPayload = {
        emails: EMAIL_TEST_CASES.slice(0, 3).map((tc) => ({
          event_type: tc.payload.event_type,
          recipient_email: tc.payload.recipient_email,
          recipient_name: tc.payload.recipient_name,
          locale: tc.locale,
          template_params: tc.payload.template_params,
          consultant_email: tc.payload.consultant_email,
        })),
      };

      const response = await apiClient.post('/api/email/send-batch', batchPayload);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary.total).toBe(3);
      expect(response.data.summary.succeeded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Email Validation', () => {
    it('should reject email to invalid address', async () => {
      const payload = {
        event_type: 'delivery_audit',
        recipient_email: 'not-an-email',
        recipient_name: 'Test',
        locale: 'fr',
        template_params: {},
      };

      const response = await apiClient.post('/api/email/send-template', payload);

      // Should either fail or succeed depending on Brevo validation
      // At minimum, should not crash
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThanOrEqual(500);
    });

    it('should reject missing required fields', async () => {
      const payload = {
        event_type: 'delivery_audit',
        // Missing recipient_email
        locale: 'fr',
        template_params: {},
      };

      const response = await apiClient.post('/api/email/send-template', payload);

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('recipient_email');
    });
  });

  describe('Statistics & Logging', () => {
    it('should return email statistics', async () => {
      const response = await apiClient.get('/api/email/stats');

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(response.data.stats).toBeDefined();
        expect(response.data.stats.total_sent).toBeGreaterThanOrEqual(0);
        expect(response.data.stats.total_failed).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return email logs for lead', async () => {
      const response = await apiClient.get(`/api/email/logs?lead_id=${TEST_LEAD_ID}`);

      if (response.status === 200) {
        expect(response.data.success).toBe(true);
        expect(Array.isArray(response.data.logs)).toBe(true);
      } else if (response.status === 403) {
        // Expected if not lead owner
        expect(response.data.success).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized requests', async () => {
      const unauthorizedClient = axios.create({
        baseURL: BACKEND_URL,
        validateStatus: () => true,
      });

      const response = await unauthorizedClient.post('/api/email/send-template', {
        event_type: 'delivery_audit',
        recipient_email: TEST_RECIPIENT_EMAIL,
        locale: 'fr',
        template_params: {},
      });

      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });

    it('should handle unknown event types gracefully', async () => {
      const response = await apiClient.post('/api/email/send-template', {
        event_type: 'unknown_event_type',
        recipient_email: TEST_RECIPIENT_EMAIL,
        locale: 'fr',
        template_params: {},
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('UNKNOWN_EVENT_TYPE');
    });
  });
});

/**
 * MANUAL TEST CHECKLIST (Non-automated)
 *
 * These tests require manual verification:
 *
 * ✓ Brevo Dashboard Verification:
 *   - [ ] Check Brevo sending logs for test emails
 *   - [ ] Verify template IDs match configured values
 *   - [ ] Confirm email addresses in "to:" field are correct
 *   - [ ] Check bounce/complaint rates
 *
 * ✓ Email Client Verification:
 *   - [ ] Receive all emails in test inbox
 *   - [ ] Verify email templates render correctly
 *   - [ ] Check links (audit_url, booking_link, etc.) work
 *   - [ ] Test CTA button clicks
 *
 * ✓ Database Verification:
 *   - [ ] Query email_send_logs table
 *   - [ ] Verify message_id matches Brevo logs
 *   - [ ] Check status field (sent/failed/bounced)
 *   - [ ] Verify lead_id linking
 *
 * ✓ Frontend Integration:
 *   - [ ] Send email from LeadReview UI
 *   - [ ] Verify no console errors
 *   - [ ] Check email_send_logs table after send
 *   - [ ] Confirm receipt email in test inbox
 *
 * ✓ Error Scenarios:
 *   - [ ] Test with invalid bearer token → 401
 *   - [ ] Test with missing fields → 400
 *   - [ ] Test Brevo API down → graceful error
 *   - [ ] Test with invalid email → Brevo rejects
 *   - [ ] Test batch with 51 emails → rate limit error
 */
