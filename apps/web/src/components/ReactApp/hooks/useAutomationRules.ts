import { useApp } from '../context/AppContext';
import { useCallback } from 'react';

/**
 * Hook to manage automation rules for pipeline transitions.
 */
export function useAutomationRules() {
    const { userProfile, updateLeadStatus } = useApp();
    const config = userProfile?.automations_config ?? {};

    /**
     * Tries to execute an automatic transition based on a rule.
     * @param ruleKey The key in automations_config to check (e.g., 'auto_step_audit')
     * @param leadId The ID of the lead to transition
     * @param targetStatus The technical status to set if the rule is enabled
     */
    const tryAutoStep = useCallback(async (
        ruleKey: 'auto_step_audit' | 'auto_step_rdv' | 'auto_step_proposal' | 'auto_step_won',
        leadId: string,
        targetStatus: string
    ) => {
        if (!config[ruleKey]) {
            console.log(`[useAutomationRules] Rule ${ruleKey} is disabled. Skipping auto-step for lead ${leadId}.`);
            return;
        }

        console.log(`[useAutomationRules] Rule ${ruleKey} is enabled. Advancing lead ${leadId} to status: ${targetStatus}`);
        try {
            await updateLeadStatus(leadId, targetStatus);
        } catch (error) {
            console.error(`[useAutomationRules] Error during auto-step for lead ${leadId}:`, error);
        }
    }, [config, updateLeadStatus]);

    return { tryAutoStep, config };
}
