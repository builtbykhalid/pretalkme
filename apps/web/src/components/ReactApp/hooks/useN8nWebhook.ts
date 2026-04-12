import { useState, useCallback } from 'react';
import { N8N_CERVEAU_WEBHOOK, N8N_PROCESS_AUDIO_WEBHOOK } from '../lib/n8n';

// N8N Webhook URL for generating dynamic questions (centralized)
const N8N_WEBHOOK_URL = N8N_CERVEAU_WEBHOOK;

interface DynamicQuestion {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'email' | 'url' | 'number';
    label: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
}

interface AIConfig {
    systemPrompt: string;
    tone: string;
    numberOfQuestions: number;
    questionComplexity: 'simple' | 'intermediate' | 'expert';
    questionContext: string;
    model: string;
}

interface WebhookPayload {
    form_id: string;
    static_answers: Record<string, string>;
    ai_config: AIConfig;
    form_title?: string;
}

interface UseN8nWebhookReturn {
    isLoading: boolean;
    error: string | null;
    dynamicQuestions: DynamicQuestion[];
    generateQuestions: (payload: WebhookPayload) => Promise<DynamicQuestion[] | null>;
    processAudio: (audioBlob: Blob, formStructure: any[]) => Promise<Record<string, string> | null>;
    reset: () => void;
}

export function useN8nWebhook(): UseN8nWebhookReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);

    const generateQuestions = useCallback(async (payload: WebhookPayload): Promise<DynamicQuestion[] | null> => {
        setIsLoading(true);
        setError(null);
        setDynamicQuestions([]);

        try {
            console.log('🚀 Calling n8n webhook', N8N_WEBHOOK_URL, 'with payload:', payload);

            const makeRequest = async (signal: AbortSignal) => {
                const res = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal,
                });

                // Try to read response text for better errors
                const text = await res.text().catch(() => null);
                let body: any = null;
                try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

                if (!res.ok) {
                    const statusMsg = `HTTP ${res.status}` + (body ? ` - ${JSON.stringify(body).slice(0, 200)}` : '');
                    const err: any = new Error(statusMsg);
                    err.responseBody = body;
                    throw err;
                }

                return body;
            };

            // Retry once for transient network errors / AbortError
            const controller = new AbortController();
            const timeoutMs = 180000; // 3 minutes
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            let data: any;
            try {
                data = await makeRequest(controller.signal);
            } catch (firstErr) {
                console.warn('First attempt to call n8n failed:', (firstErr as any)?.message || firstErr);
                // Retry once for network/abort errors (do not retry for 4xx client errors)
                if ((firstErr as any)?.message && /^HTTP 4\d\d/.test((firstErr as any).message)) {
                    clearTimeout(timeoutId);
                    throw firstErr; // client error, don't retry
                }

                // second attempt with fresh controller
                clearTimeout(timeoutId);
                const controller2 = new AbortController();
                const timeoutId2 = setTimeout(() => controller2.abort(), timeoutMs);
                try {
                    data = await makeRequest(controller2.signal);
                } finally {
                    clearTimeout(timeoutId2);
                }
            } finally {
                clearTimeout(timeoutId);
            }

            console.log('✅ n8n raw response:', JSON.stringify(data, null, 2));

            // Handle different response structures from n8n
            let questions: DynamicQuestion[] = [];

            // Function to safely extract questions from various formats
            const extractQuestions = (obj: any): DynamicQuestion[] => {
                // Direct questions array
                if (obj?.questions && Array.isArray(obj.questions)) {
                    return obj.questions;
                }
                // Direct array
                if (Array.isArray(obj)) {
                    return obj;
                }
                // Nested structures
                if (obj?.output?.questions) return obj.output.questions;
                if (obj?.response?.questions) return obj.response.questions;
                if (obj?.data?.questions) return obj.data.questions;

                // If there's a raw/text field with JSON string, try to parse it
                const rawText = obj?.raw || obj?.text || obj?.message;
                if (typeof rawText === 'string') {
                    console.log('🔍 Trying to extract from raw text:', rawText.substring(0, 200));
                    try {
                        // Clean up common Ollama JSON issues
                        const cleaned = rawText
                            .replace(/```json\n?/gi, '')
                            .replace(/```\n?/gi, '')
                            .replace(/\n/g, ' ')
                            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                            .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
                            .replace(/"\s+"/g, '","') // Fix missing commas between strings
                            .trim();

                        // Find JSON object
                        const jsonMatch = cleaned.match(/\{[\s\S]*"questions"[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (parsed.questions) return parsed.questions;
                        }
                    } catch (e) {
                        console.warn('Failed to parse raw text:', e);
                    }
                }

                return [];
            };

            questions = extractQuestions(data);
            console.log('📋 Extracted questions:', questions);

            if (questions.length > 0) {
                // Ensure each question has an id and valid properties
                const questionsWithIds = questions.map((q: any, index: number) => ({
                    id: q.id || `dq_${index + 1}`,
                    type: q.type || 'text',
                    label: q.label || `Question ${index + 1}`,
                    placeholder: q.placeholder || '',
                    options: Array.isArray(q.options) ? q.options : undefined,
                    required: q.required !== false,
                }));

                console.log('✅ Final questions:', questionsWithIds);
                setDynamicQuestions(questionsWithIds);
                return questionsWithIds;
            } else {
                console.error('❌ No questions found in response:', data);
                if (data.error) {
                    throw new Error(data.error + (data.raw ? ` - Raw: ${data.raw.substring(0, 100)}` : ''));
                }
                throw new Error('Aucune question générée par l\'IA');
            }
        } catch (err: any) {
            console.error('❌ n8n webhook error:', err);

            if (err.name === 'AbortError') {
                setError('Délai d\'attente dépassé. Veuillez réessayer.');
            } else {
                setError(err.message || 'Une erreur est survenue');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processAudio = useCallback(async (audioBlob: Blob, formStructure: any[]): Promise<Record<string, string> | null> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🎙️ Calling n8n audio processing webhook', N8N_PROCESS_AUDIO_WEBHOOK);

            // Convert Blob to base64 to send in JSON
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(audioBlob);
            const base64Audio = await base64Promise;

            const res = await fetch(N8N_PROCESS_AUDIO_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    form_structure: formStructure
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            console.log('✅ n8n audio response:', data);

            // Handle response: expect { answers: { field_id: "value", ... }, flags?: [ "field_id", ... ] }
            if (data.answers) {
                return data.answers;
            } else if (typeof data === 'object' && !Array.isArray(data)) {
                // If the entire object is the answer map
                return data;
            }

            return null;
        } catch (err: any) {
            console.error('❌ n8n audio error:', err);
            setError(err.message || 'Erreur lors du traitement audio');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setDynamicQuestions([]);
    }, []);

    return {
        isLoading,
        error,
        dynamicQuestions,
        generateQuestions,
        processAudio,
        reset,
    };
}

export type { DynamicQuestion, AIConfig, WebhookPayload };
