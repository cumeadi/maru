import axios from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RubricCriterion {
  name: string;
  description: string;
  criterion_type: 'pass_fail' | 'score_1_to_10' | 'penalty';
  weight?: number;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
}

export interface CriterionResult {
  criterion_name: string;
  passed: boolean;
  score: number | null;
  reasoning: string;
}

export interface EvaluationResult {
  run_id: string;
  overall_score: number;
  passed: boolean;
  criteria_results: CriterionResult[];
  latency_ms: number;
  token_usage: number;
  pii_redacted: boolean;
}

export type FeedbackAction = 'accepted' | 'rejected' | 'regenerated' | 'edited';

// ── Pre-built Template IDs ─────────────────────────────────────────────────────

export const TEMPLATES = {
  RAG_HALLUCINATION: 'rag-hallucination',
  JSON_STRICT: 'json-strict',
  SUPPORT_TONE: 'support-tone',
  TOXICITY_FILTER: 'toxicity-filter',
} as const;

// ── Client ─────────────────────────────────────────────────────────────────────

export class MaruClient {
  private apiKey: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(apiKey: string, baseUrl: string = 'http://localhost:8000') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async evaluate(
    prompt: string,
    output: string,
    rubric: Rubric,
    judgeModel: string = 'gpt-4o'
  ): Promise<EvaluationResult> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/evaluate`,
      { prompt, output, rubric, judge_model: judgeModel },
      { headers: this.headers }
    );
    return response.data;
  }

  async test(
    prompt: string,
    output: string,
    rubric: Rubric,
    threshold: number = 90.0
  ): Promise<boolean> {
    const result = await this.evaluate(prompt, output, rubric);
    if (!result.passed || result.overall_score < threshold) {
      console.error(`[Maru] ✗ Test Failed — Score: ${result.overall_score}/${threshold}`);
      result.criteria_results.forEach((c) => {
        const icon = c.passed ? '✓' : '✗';
        console.error(`  ${icon} ${c.criterion_name}: ${c.reasoning}`);
      });
      return false;
    }
    console.log(`[Maru] ✓ Test Passed — Score: ${result.overall_score}/${threshold}`);
    return true;
  }

  shadowTest(
    prompt: string,
    output: string,
    rubric: Rubric,
    judgeModel: string = 'gpt-4o'
  ): void {
    /**
     * Shadow Mode — fire-and-forget evaluation.
     * The promise is deliberately NOT awaited. This adds zero latency to the caller.
     */
    axios
      .post(
        `${this.baseUrl}/api/v1/evaluate`,
        { prompt, output, rubric, judge_model: judgeModel, is_shadow: true },
        { headers: this.headers }
      )
      .catch((err) => {
        console.warn(`[Maru Shadow] Background eval failed silently: ${err.message}`);
      });
  }

  async logFeedback(
    runId: string,
    action: FeedbackAction,
    note?: string
  ): Promise<{ status: string; run_id: string; action: string }> {
    /**
     * Log implicit user feedback correlated to a run_id.
     * Call this when the user clicks "regenerate", "thumbs down", or edits the AI output.
     */
    const response = await axios.post(
      `${this.baseUrl}/api/v1/feedback`,
      { run_id: runId, action, note },
      { headers: this.headers }
    );
    return response.data;
  }

  async getTemplates(): Promise<Record<string, Rubric>> {
    /**
     * Fetch all pre-built rubric templates from the Maru engine.
     * Use TEMPLATES constants as keys (e.g. TEMPLATES.RAG_HALLUCINATION).
     */
    const response = await axios.get(`${this.baseUrl}/api/v1/rubrics/templates`, {
      headers: this.headers,
    });
    return response.data;
  }
}

