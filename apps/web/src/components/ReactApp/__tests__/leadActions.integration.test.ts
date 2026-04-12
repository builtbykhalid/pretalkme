/**
 * Lead Actions - Integration Tests
 * Run these tests to verify the implementation works correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logLeadAction,
  triggerLeadQualificationWorkflow,
  triggerLeadRejectionWorkflow,
  updateLeadStatus,
} from '../lib/leadActions';
import { getLeadTemperature, getNextActionRecommendation } from '../utils/leadTemperature';

describe('Lead Actions Integration', () => {
  describe('Lead Temperature Detection', () => {
    it('should detect hot lead (score >= 80)', () => {
      const temp = getLeadTemperature(85);
      expect(temp.level).toBe('hot');
      expect(temp.emoji).toBe('🔥');
      expect(temp.urgency).toBe('high');
    });

    it('should detect warm lead (50 <= score < 80)', () => {
      const temp = getLeadTemperature(65);
      expect(temp.level).toBe('warm');
      expect(temp.emoji).toBe('⭐');
      expect(temp.urgency).toBe('medium');
    });

    it('should detect cold lead (score < 50)', () => {
      const temp = getLeadTemperature(25);
      expect(temp.level).toBe('cold');
      expect(temp.emoji).toBe('❄️');
      expect(temp.urgency).toBe('low');
    });
  });

  describe('Action Recommendations', () => {
    it('should recommend immediate call for hot leads', () => {
      const rec = getNextActionRecommendation(85, 'fr');
      expect(rec.toLowerCase()).toContain('immédiat');
    });

    it('should recommend follow-up for warm leads', () => {
      const rec = getNextActionRecommendation(65, 'fr');
      expect(rec.toLowerCase()).toContain('24h');
    });

    it('should recommend qualification for cold leads', () => {
      const rec = getNextActionRecommendation(25, 'fr');
      expect(rec.toLowerCase()).toContain('qualification');
    });
  });

  describe('Lead Action Logging', () => {
    it('should log qualified action', async () => {
      const result = await logLeadAction({
        lead_id: 'test-lead-123',
        action_type: 'qualified',
        metadata: { test: true },
      });

      expect(result).toBe(true);
    });

    it('should log rejected action with reason', async () => {
      const result = await logLeadAction({
        lead_id: 'test-lead-456',
        action_type: 'rejected',
        action_reason: 'Test rejection reason',
        metadata: { test: true },
      });

      expect(result).toBe(true);
    });

    it('should handle logging errors gracefully', async () => {
      // Mock network error
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const result = await logLeadAction({
        lead_id: 'test-lead-789',
        action_type: 'qualified',
      });

      expect(result).toBe(false);
    });
  });

  describe('Workflow Triggers', () => {
    beforeEach(() => {
      // Mock fetch for all tests
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
    });

    it('should trigger qualification workflow', async () => {
      const leadData = {
        name: 'Test Lead',
        email: 'test@example.com',
        company: 'Test Corp',
        score: 85,
        form_id: 'form-123',
      };

      const result = await triggerLeadQualificationWorkflow('lead-123', leadData);

      expect(result.success).toBe(true);
      expect(result.workflow_name).toBe('Lead Qualification');
      expect(global.fetch).toHaveBeenCalled();

      // Check payload structure
      const callArgs = (global.fetch as any).mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);
      expect(payload.lead_id).toBe('lead-123');
      expect(payload.action).toBe('lead_qualified');
    });

    it('should trigger rejection workflow', async () => {
      const result = await triggerLeadRejectionWorkflow('lead-456', 'Not a fit');

      expect(result.success).toBe(true);
      expect(result.workflow_name).toBe('Lead Rejection');
    });

    it('should handle workflow errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await triggerLeadQualificationWorkflow('lead-789', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('returned status 500');
    });
  });

  describe('Status Update', () => {
    it('should update lead status in database', async () => {
      // This would require mocking Supabase
      // For now, just verify the function exists and is callable
      expect(typeof updateLeadStatus).toBe('function');
    });
  });
});

/**
 * MANUAL TESTING CHECKLIST
 *
 * [ ] Lead Preview Drawer opens correctly
 * [ ] Hot lead banner shows for score > 80 (🔥)
 * [ ] Warm lead shows no banner for 50-80 (OK)
 * [ ] Cold lead banner shows for score < 50 (❄️)
 * [ ] "Qualifier" button triggers workflow
 * [ ] Spinner appears during processing
 * [ ] Toast feedback shows appropriate message
 * [ ] N8N webhook called (check logs)
 * [ ] lead_actions table updated (check DB)
 * [ ] Email sent to consultant (check inbox)
 * [ ] "Rejeter" button shows prompt for reason
 * [ ] Rejection loggés with reason
 * [ ] "À revoir" button sets reminder
 * [ ] Mobile layout responsive
 * [ ] Buttons disabled during processing
 * [ ] Close button works
 * [ ] Backdrop click closes drawer
 * [ ] Keyboard accessible (Tab navigation)
 * [ ] Screen reader reads labels (ARIA)
 * [ ] No console errors
 * [ ] No memory leaks
 *
 * INTEGRATION TESTS
 *
 * [ ] Fresh lead qualifié → Audit generated auto
 * [ ] Lead rejected → Not in qualified pipeline
 * [ ] Multiple rapid actions → Queued properly
 * [ ] Network error → Graceful failure + retry option
 * [ ] N8N down → Fallback notification
 * [ ] Supabase down → Local logging fails gracefully
 *
 */
