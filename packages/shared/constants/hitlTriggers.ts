export const HITL_TRIGGERS = {
  LOW_CONFIDENCE: 'low_confidence',
  COMPLAINT_DETECTED: 'complaint_detected',
  NEGATIVE_SENTIMENT: 'negative_sentiment',
  LOOP_DETECTED: 'loop_detected',
  OUT_OF_SCOPE: 'out_of_scope',
  SAFETY_MODE: 'safety_mode',
} as const;

export type HitlTrigger = (typeof HITL_TRIGGERS)[keyof typeof HITL_TRIGGERS];
