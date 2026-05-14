import os
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from api.schemas import EvaluationRequest, EvaluationResult, FeedbackRequest
from api.database import init_db, get_db
from core.judge import judge_engine
from core.rubrics import ALL_TEMPLATES
from core.models import FeedbackLog

# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Maru Evaluation Engine",
    description="Evaluation & Telemetry Layer for AI Agents — ParallelScore Cognitive Stack",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten in production to your UI domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    """Create all DB tables on boot (idempotent — safe to run repeatedly)."""
    await init_db()

# ── Auth ───────────────────────────────────────────────────────────────────────

_bearer = HTTPBearer(auto_error=False)
_API_SECRET = os.environ.get("MARU_API_SECRET", "change-me-in-production")

def require_api_key(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> str:
    """
    Validate Bearer token against MARU_API_SECRET env var.
    Returns the token on success; raises 401 on missing/invalid credentials.
    """
    if credentials is None or credentials.credentials != _API_SECRET:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key. Set Authorization: Bearer <MARU_API_SECRET>.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "service": "maru-engine", "version": "0.1.0"}


# ── Evaluation ─────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/evaluate",
    response_model=EvaluationResult,
    tags=["Evaluation"],
    dependencies=[Depends(require_api_key)],
)
async def evaluate_output(request: EvaluationRequest, background_tasks: BackgroundTasks):
    """
    Run a behavioral evaluation against a rubric.

    - **is_shadow=True**: dispatches as a background task and returns a 202 stub immediately
      (zero latency impact on live traffic — Shadow Mode).
    - **is_shadow=False** (default): blocks until the LLM judge returns a full result.
    """
    if request.is_shadow:
        background_tasks.add_task(judge_engine.evaluate, request)
        return EvaluationResult(
            run_id=request.run_id,
            overall_score=-1.0,
            passed=True,
            criteria_results=[],
            latency_ms=0.0,
            token_usage=0,
            pii_redacted=False,
        )

    return judge_engine.evaluate(request)


# ── Implicit Feedback ──────────────────────────────────────────────────────────

@app.post(
    "/api/v1/feedback",
    status_code=201,
    tags=["Feedback"],
    dependencies=[Depends(require_api_key)],
)
async def log_feedback(feedback: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """
    Receive implicit user feedback (accepted / rejected / regenerated / edited)
    and persist it correlated to the originating evaluation run_id.
    """
    entry = FeedbackLog(
        run_id=feedback.run_id,
        action=feedback.action,
        note=feedback.note,
    )
    db.add(entry)
    await db.commit()
    return {"status": "logged", "run_id": feedback.run_id, "action": feedback.action}


@app.get(
    "/api/v1/feedback/{run_id}",
    tags=["Feedback"],
    dependencies=[Depends(require_api_key)],
)
async def get_feedback(run_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all persisted feedback events for a specific evaluation run."""
    result = await db.execute(
        select(FeedbackLog).where(FeedbackLog.run_id == run_id)
    )
    events = result.scalars().all()
    if not events:
        raise HTTPException(status_code=404, detail=f"No feedback found for run_id: {run_id}")
    return {
        "run_id": run_id,
        "events": [
            {"id": e.id, "action": e.action, "note": e.note, "created_at": str(e.created_at)}
            for e in events
        ],
    }


# ── Rubric Templates ───────────────────────────────────────────────────────────

@app.get("/api/v1/rubrics/templates", tags=["Rubrics"])
async def list_rubric_templates():
    """Return all available pre-built rubric templates (no auth required — public catalog)."""
    return {key: rubric.model_dump() for key, rubric in ALL_TEMPLATES.items()}


@app.get("/api/v1/rubrics/templates/{template_id}", tags=["Rubrics"])
async def get_rubric_template(template_id: str):
    """Return a single rubric template by ID."""
    if template_id not in ALL_TEMPLATES:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found.")
    return ALL_TEMPLATES[template_id].model_dump()
