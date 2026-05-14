from pydantic import BaseModel, Field
from typing import List, Optional, Union, Any, Literal
import uuid

class RubricCriterion(BaseModel):
    name: str
    description: str
    criterion_type: Literal["pass_fail", "score_1_to_10", "penalty"]
    weight: float = 1.0

class Rubric(BaseModel):
    id: str
    name: str
    criteria: List[RubricCriterion]

class EvaluationRequest(BaseModel):
    prompt: str
    output: str
    rubric: Rubric
    judge_model: str = "gpt-4o"
    context: Optional[dict[str, Any]] = None
    is_shadow: bool = False  # Shadow Mode: fire-and-forget, no blocking
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class CriterionResult(BaseModel):
    criterion_name: str
    passed: bool
    score: Optional[float] = None
    reasoning: str

class EvaluationResult(BaseModel):
    run_id: str
    overall_score: float
    passed: bool
    criteria_results: List[CriterionResult]
    latency_ms: float
    token_usage: int
    pii_redacted: bool = False  # True if PII was detected and scrubbed before judge

# ── Implicit Feedback ──────────────────────────────────────────────────────────

class FeedbackAction(str):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    REGENERATED = "regenerated"
    EDITED = "edited"

class FeedbackRequest(BaseModel):
    run_id: str
    action: Literal["accepted", "rejected", "regenerated", "edited"]
    note: Optional[str] = None  # Optional freeform annotation from the application
