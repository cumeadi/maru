import time
import json
from litellm import completion
from api.schemas import EvaluationRequest, EvaluationResult, CriterionResult
from core.pii import redact_pii

class LLMJudge:
    def __init__(self):
        self.system_prompt = (
            "You are an expert AI evaluator. Your job is to evaluate the output of another AI "
            "agent based on a specific rubric. You must critically analyze the output against "
            "each criterion and provide a score, pass/fail status, and step-by-step reasoning."
        )

    def evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        start_time = time.time()

        # 0. PII Redaction — scrub before any data leaves the perimeter
        clean_prompt, prompt_pii = redact_pii(request.prompt)
        clean_output, output_pii = redact_pii(request.output)
        pii_was_redacted = bool(prompt_pii or output_pii)
        
        # 1. Heuristics Pre-check
        for crit in request.rubric.criteria:
            if crit.name.lower() == "valid json":
                try:
                    json.loads(request.output)
                except json.JSONDecodeError:
                    return EvaluationResult(
                        run_id=request.run_id,
                        overall_score=0.0,
                        passed=False,
                        criteria_results=[
                            CriterionResult(
                                criterion_name=crit.name,
                                passed=False,
                                score=0.0,
                                reasoning="Heuristic Pre-check Failed: Output is not valid JSON. Bypassing LLM judge."
                            )
                        ],
                        latency_ms=round((time.time() - start_time) * 1000, 2),
                        token_usage=0,
                        pii_redacted=pii_was_redacted
                    )
            elif crit.name.lower() == "length limit" and len(request.output) > 2000:
                 return EvaluationResult(
                        run_id=request.run_id,
                        overall_score=0.0,
                        passed=False,
                        criteria_results=[
                            CriterionResult(
                                criterion_name=crit.name,
                                passed=False,
                                score=0.0,
                                reasoning="Heuristic Pre-check Failed: Output exceeds 2000 character limit. Bypassing LLM judge."
                            )
                        ],
                        latency_ms=round((time.time() - start_time) * 1000, 2),
                        token_usage=0,
                        pii_redacted=pii_was_redacted
                    )

        # 2. LLM Judge — uses PII-scrubbed copies of prompt and output
        criteria_text = ""
        for c in request.rubric.criteria:
            criteria_text += f"- {c.name} ({c.criterion_type}): {c.description}\n"
        
        user_prompt = (
            f"Prompt: {clean_prompt}\n"
            f"Output to evaluate: {clean_output}\n\n"
            f"Rubric:\n{criteria_text}\n"
            "Evaluate each criterion. Return a JSON object strictly matching this schema:\n"
            "{\n"
            '  "criteria_results": [\n'
            '    {\n'
            '      "criterion_name": "string",\n'
            '      "passed": boolean,\n'
            '      "score": float or null,\n'
            '      "reasoning": "string"\n'
            '    }\n'
            "  ]\n"
            "}"
        )

        try:
            response = completion(
                model=request.judge_model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={ "type": "json_object" },
                temperature=0.0
            )
            
            raw_content = response.choices[0].message.content
            parsed_result = json.loads(raw_content)
            token_usage = response.usage.total_tokens if response.usage else 0
            
            criteria_results = []
            overall_score = 0.0
            total_weight = 0.0
            all_passed = True
            
            for res, crit in zip(parsed_result.get("criteria_results", []), request.rubric.criteria):
                c_score = res.get("score")
                if crit.criterion_type == "pass_fail":
                    c_score = 10.0 if res.get("passed") else 0.0
                elif crit.criterion_type == "penalty" and not res.get("passed"):
                    c_score = -10.0
                
                overall_score += (c_score or 0) * crit.weight
                total_weight += crit.weight
                
                if not res.get("passed"):
                    all_passed = False
                    
                criteria_results.append(
                    CriterionResult(
                        criterion_name=crit.name,
                        passed=res.get("passed", False),
                        score=res.get("score"),
                        reasoning=res.get("reasoning", "")
                    )
                )
                
            final_score = (overall_score / total_weight) * 10 if total_weight > 0 else 0
            latency = (time.time() - start_time) * 1000
            
            return EvaluationResult(
                run_id=request.run_id,
                overall_score=round(final_score, 2),
                passed=all_passed,
                criteria_results=criteria_results,
                latency_ms=round(latency, 2),
                token_usage=token_usage,
                pii_redacted=pii_was_redacted
            )

        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return EvaluationResult(
                run_id=request.run_id,
                overall_score=0.0,
                passed=False,
                criteria_results=[
                    CriterionResult(
                        criterion_name="System Error",
                        passed=False,
                        score=0.0,
                        reasoning=f"Evaluation failed to execute: {str(e)}"
                    )
                ],
                latency_ms=round(latency, 2),
                token_usage=0,
                pii_redacted=pii_was_redacted
            )

judge_engine = LLMJudge()
