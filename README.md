<p align="center">
  <img src="https://img.shields.io/badge/Maru-Evaluation%20%26%20Telemetry-1b61c9?style=for-the-badge&labelColor=181d26" alt="Maru" />
</p>

<p align="center">
  <strong>Behavioral evaluation and telemetry for AI agents.</strong><br/>
  Stop guessing whether your agents are working. Start knowing.
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-1b61c9.svg" alt="Apache 2.0" /></a>
  <img src="https://img.shields.io/badge/Python-3.11%2B-254fad" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/FastAPI-0.110%2B-006400" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Node.js-20%2B-254fad" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Next.js-16-181d26" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/status-v0.1.0-1b61c9" alt="v0.1.0" />
</p>

---

## What Is Maru?

Modern AI systems fail silently. A model update quietly degrades tone. A retrieval change starts hallucinating facts. A prompt tweak breaks JSON schema conformance. Your users notice before you do.

**Maru is the evaluation and telemetry layer that catches these regressions automatically** — before they reach production and before users feel them.

It provides three things:

1. **An LLM-as-a-Judge engine** that scores agent outputs against rubric criteria with Chain-of-Thought reasoning
2. **A behavioral test runner** that gates CI/CD deployments on alignment thresholds (`maru.test()`)
3. **A real-time telemetry loop** that evaluates live traffic in the background (Shadow Mode) and alerts on drift

Maru is one layer of the **ParallelScore Cognitive Stack**:

| Layer | Product | Responsibility |
|---|---|---|
| Memory | [Synapse](https://github.com/parallelscor/synapse) | What agents know and remember |
| Governance | [Nzube](https://github.com/parallelscor/nzube) | What agents are permitted to do |
| **Evaluation** | **Maru** | Whether agents are actually doing it correctly |

---

## Features

| Feature | Description |
|---|---|
| 🧠 **LLM-as-a-Judge** | GPT-4o, Claude, Gemini judge outputs against structured rubrics with CoT reasoning |
| 📐 **Rubric Templates** | 4 production-ready templates out of the box (RAG, JSON, CX, Safety) |
| 🛡️ **PII Redaction** | Regex cascade scrubs emails, SSNs, phones, IPs before any data reaches the LLM |
| ⚡ **Heuristic Pre-checks** | Deterministic JSON/length validation runs before the LLM — zero token cost |
| 🌑 **Shadow Mode** | Fire-and-forget evaluation on live traffic with zero latency impact |
| 🔁 **Implicit Feedback** | Correlate thumbs-down / regenerate signals to evaluation run IDs |
| 🚨 **Drift Detection** | Rolling alignment alerts via Slack when scores fall below threshold |
| 🔒 **Bearer Auth** | API key validation on all write endpoints |
| 🐘 **Postgres Persistence** | All evaluation runs and feedback events stored in SQLAlchemy-managed tables |
| 📦 **Python + Node SDKs** | Identical API surface in both languages with `TEMPLATES` constants |

---

## Open Source Boundary

| Component | Licence | What's included |
|---|---|---|
| `engine/` | ✅ Apache 2.0 | FastAPI evaluation engine, judge, PII scrubber, rubric catalog |
| `sdk-python/` | ✅ Apache 2.0 | Python client — `evaluate()`, `test()`, `shadow_test()`, `log_feedback()` |
| `sdk-node/` | ✅ Apache 2.0 | TypeScript client — identical API surface |
| `ui/` | 🔒 Commercial | Creator Sandbox — Golden Dataset, Arena, Heatmap, Telemetry Dashboard |
| Managed Cloud | 🔒 Commercial | Hosted engine with SLAs, auto-scaling, RBAC |
| Enterprise Telemetry | 🔒 Commercial | PagerDuty alerting, compliance exports, SSO |

---

## Architecture

```
maru/
├── engine/                        # Open-source FastAPI evaluation engine
│   ├── api/
│   │   ├── main.py                # Routes + Bearer auth + CORS + startup
│   │   ├── schemas.py             # Pydantic v2 request/response models
│   │   └── database.py            # Async SQLAlchemy session factory
│   ├── core/
│   │   ├── judge.py               # LLM-as-a-Judge pipeline (PII → heuristics → LLM)
│   │   ├── pii.py                 # Regex-based PII scrubber
│   │   ├── rubrics.py             # Pre-built rubric template catalog
│   │   ├── models.py              # SQLAlchemy ORM models
│   │   └── telemetry.py           # Drift detection + Slack alerting
│   ├── tests/
│   │   └── test_verification.py   # PII, Shadow Mode, Feedback schema tests
│   ├── Dockerfile
│   └── pyproject.toml
│
├── sdk-python/                    # Open-source Python SDK
│   └── maru/
│       ├── client.py              # MaruClient + TEMPLATES constants
│       └── __init__.py
│
├── sdk-node/                      # Open-source TypeScript SDK
│   └── src/
│       └── index.ts               # MaruClient + TEMPLATES enum
│
├── ui/                            # Commercial — Creator Sandbox (Next.js 16)
│
├── docker-compose.yml             # Engine + Postgres — one command to run
├── .env.example                   # All env vars documented with safe defaults
├── CONTRIBUTING.md
└── LICENSE                        # Apache 2.0
```

---

## Evaluation Cascade

Every request runs through a cost-optimised 3-layer pipeline. Cheaper checks gate expensive LLM calls:

```
Incoming Request
       │
       ▼
┌─────────────────────┐
│  1. PII Redaction   │  Emails, SSNs, phones, IPs, credit cards masked
│     (always on)     │  → payload never leaves perimeter with raw PII
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Heuristics      │  JSON validity, length limits
│  (deterministic)    │  → pass/fail at zero token cost
└──────────┬──────────┘
           │  (only if heuristics pass)
           ▼
┌─────────────────────┐
│  3. LLM Judge       │  GPT-4o / Claude / Gemini
│  (per-criterion)    │  → scored result with Chain-of-Thought reasoning
└──────────┬──────────┘
           │
           ▼
    EvaluationResult
  { score, passed, criteria_results, pii_redacted, latency_ms }
```

---

## Quick Start

### Prerequisites

- Docker + Docker Compose
- An OpenAI API key (or Anthropic / Gemini — configurable via `JUDGE_MODEL`)

### 1. Clone & Configure

```bash
git clone https://github.com/parallelscor/maru.git
cd maru

# Copy and fill in your environment variables
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
OPENAI_API_KEY=sk-...
MARU_API_SECRET=your-secret-key   # used as Bearer token by SDKs
```

### 2. Start the Stack

```bash
docker-compose up --build
```

This starts:
- **`maru-engine`** on `http://localhost:8000` (FastAPI + Uvicorn)
- **`postgres`** on `localhost:5432` (auto-creates tables on first boot)

Verify the engine is live:

```bash
curl http://localhost:8000/health
# → {"status": "ok", "service": "maru-engine", "version": "0.1.0"}
```

Interactive API docs: **http://localhost:8000/docs**

---

## Python SDK

### Install

```bash
pip install maru-sdk
```

### Usage

```python
from maru import MaruClient, TEMPLATES

maru = MaruClient(
    api_key="your-maru-api-secret",
    base_url="http://localhost:8000",   # or your hosted engine URL
)

# ── Load a pre-built rubric template ──────────────────────────────────────────
templates = maru.get_templates()
rubric    = templates[TEMPLATES.SUPPORT_TONE]

# ── Blocking evaluation ────────────────────────────────────────────────────────
result = maru.evaluate(prompt, agent_output, rubric)
print(result["overall_score"])   # 0–100
print(result["criteria_results"])

# ── CI/CD gate — fails the build if score < threshold ─────────────────────────
passed = maru.test(prompt, agent_output, rubric, threshold=90.0)
if not passed:
    raise SystemExit(1)

# ── Shadow Mode — evaluate live traffic with zero latency impact ───────────────
maru.shadow_test(prompt, live_output, rubric)  # daemon thread, fire-and-forget

# ── Implicit feedback — close the loop from prod signals ──────────────────────
maru.log_feedback(run_id="abc-123", action="rejected", note="Wrong tone")
```

### `TEMPLATES` Constants

```python
from maru import TEMPLATES

TEMPLATES.RAG_HALLUCINATION   # "rag-hallucination"
TEMPLATES.JSON_STRICT         # "json-strict"
TEMPLATES.SUPPORT_TONE        # "support-tone"
TEMPLATES.TOXICITY_FILTER     # "toxicity-filter"
```

---

## Node.js / TypeScript SDK

### Install

```bash
npm install @maru/sdk
```

### Usage

```typescript
import { MaruClient, TEMPLATES } from "@maru/sdk";

const maru = new MaruClient(
  process.env.MARU_API_KEY!,
  process.env.MARU_BASE_URL ?? "http://localhost:8000",
);

// Load a rubric template
const templates = await maru.getTemplates();
const rubric    = templates[TEMPLATES.RAG_HALLUCINATION];

// CI/CD gate
const passed = await maru.test(prompt, agentOutput, rubric, 90.0);
if (!passed) process.exit(1);

// Shadow Mode — fire-and-forget, never awaited
maru.shadowTest(prompt, liveOutput, rubric);

// Implicit feedback
await maru.logFeedback(runId, "regenerated");
```

---

## Rubric Templates

All templates are available at `GET /api/v1/rubrics/templates` — no auth required.

### `rag-hallucination` — RAG Hallucination Detector

Best for: knowledge base Q&A, document chat, retrieval-augmented agents.

| Criterion | Type | Weight |
|---|---|---|
| Grounding | Pass/Fail | 3× |
| No Fabrication | Pass/Fail | 3× |
| Citation Accuracy | 1–10 Score | 1× |

### `json-strict` — JSON Strict Schema

Best for: structured output agents, tool-call formatters, API response generators.

| Criterion | Type | Weight |
|---|---|---|
| Valid JSON | Pass/Fail | 3× |
| Schema Compliance | Pass/Fail | 3× |
| No Extra Keys | Pass/Fail | 1× |

### `support-tone` — Customer Support Tone & Empathy

Best for: live chat agents, ticket responders, customer success bots.

| Criterion | Type | Weight |
|---|---|---|
| Empathy | 1–10 Score | 2× |
| Actionability | 1–10 Score | 2× |
| No Competitor Mention | Penalty | 2× |
| Brevity | 1–10 Score | 1× |

### `toxicity-filter` — Toxicity & Safety Filter

Best for: public-facing agents, consumer products, regulated industries.

| Criterion | Type | Weight |
|---|---|---|
| No Hate Speech | Pass/Fail | 3× |
| No Self-Harm Content | Pass/Fail | 3× |
| Professional Tone | Pass/Fail | 1× |

---

## API Reference

All write endpoints require `Authorization: Bearer <MARU_API_SECRET>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Engine liveness check |
| `POST` | `/api/v1/evaluate` | ✅ | Run a behavioral evaluation |
| `POST` | `/api/v1/feedback` | ✅ | Log implicit user feedback |
| `GET` | `/api/v1/feedback/{run_id}` | ✅ | Get all feedback for a run |
| `GET` | `/api/v1/rubrics/templates` | — | List all rubric templates |
| `GET` | `/api/v1/rubrics/templates/{id}` | — | Get a single template |

### `POST /api/v1/evaluate`

```json
{
  "prompt":      "How do I reset my password?",
  "output":      "Go to Settings › Security › Reset Password.",
  "rubric":      { "id": "support-tone", "name": "...", "criteria": [...] },
  "judge_model": "gpt-4o",
  "is_shadow":   false,
  "run_id":      "auto-generated-uuid-if-omitted"
}
```

**Response:**

```json
{
  "run_id":          "3f8a2c1d-...",
  "overall_score":   94.5,
  "passed":          true,
  "pii_redacted":    false,
  "latency_ms":      812.4,
  "token_usage":     312,
  "criteria_results": [
    {
      "criterion_name": "Empathy",
      "passed":         true,
      "score":          8.5,
      "reasoning":      "The response acknowledges the customer's need immediately..."
    }
  ]
}
```

**Shadow Mode** (`is_shadow: true`): returns a `202` stub instantly and runs the evaluation asynchronously.

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/maru-eval.yml
name: Behavioral Evaluation Gate

on: [pull_request]

jobs:
  maru-eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Maru SDK
        run: pip install maru-sdk

      - name: Run behavioral evaluation
        env:
          MARU_API_KEY: ${{ secrets.MARU_API_KEY }}
          MARU_BASE_URL: ${{ secrets.MARU_BASE_URL }}
        run: python3 eval/run_eval.py
```

```python
# eval/run_eval.py
import os, sys
from maru import MaruClient, TEMPLATES

maru = MaruClient(os.environ["MARU_API_KEY"], os.environ["MARU_BASE_URL"])
rubric = maru.get_templates()[TEMPLATES.SUPPORT_TONE]

test_cases = [
    ("How do I cancel?", "I'm sorry to hear that. Here's how to cancel your subscription..."),
    ("This is broken!", "I understand how frustrating that must be. Let me help you fix it..."),
]

for prompt, output in test_cases:
    if not maru.test(prompt, output, rubric, threshold=88.0):
        print(f"[Maru] FAILED: '{prompt[:40]}...'")
        sys.exit(1)

print("[Maru] All evaluation gates passed.")
```

---

## Environment Variables

See [`.env.example`](./.env.example) for the full reference. Key variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | LLM provider key for the judge |
| `MARU_API_SECRET` | ✅ | `change-me-in-production` | Bearer token validated on all write routes |
| `DATABASE_URL` | ✅ | Postgres docker default | SQLAlchemy async connection string |
| `JUDGE_MODEL` | — | `gpt-4o` | Default judge model (any LiteLLM-supported model) |
| `SLACK_WEBHOOK_URL` | — | — | Drift detection alerts (leave blank to disable) |
| `DRIFT_ALERT_THRESHOLD` | — | `85.0` | Rolling alignment score that triggers Slack alert |

---

## Running Tests

```bash
cd engine
python3 tests/test_verification.py
```

Expected output:

```
── PII Redaction Tests
  ✓ [Email]  ✓ [SSN]  ✓ [Phone]  ✓ [IP]  ✓ [Clean]

── Shadow Mode Non-Blocking Test
  ✓ Dispatch returned in 0.05ms (threshold: <50ms)
  ✓ Background evaluation completed after thread join

── Implicit Feedback Schema Test
  ✓ action='accepted'  ✓ 'rejected'  ✓ 'regenerated'  ✓ 'edited'
  ✓ Invalid action correctly rejected

──────────────────────────────────────────────────
✓ 3/3 test suites passed
```

---

## Contributing

We welcome rubric templates, heuristic additions, and SDK ports. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

Quick summary:
1. Fork → branch → PR against `engine/`, `sdk-python/`, or `sdk-node/`
2. New rubric templates go in `engine/core/rubrics.py` + `ALL_TEMPLATES` dict
3. Include a test or example prompt/output pair in your PR description

---

## Roadmap

- [ ] **Alembic migrations** — version-controlled schema management
- [ ] **Async judge pipeline** — non-blocking LLM calls with `httpx` async client
- [ ] **Cost analytics** — per-run token cost tracking and visualisation
- [ ] **Multi-judge consensus** — run two models and flag disagreements
- [ ] **SDK Go port** — `maru-sdk-go`
- [ ] **Webhook delivery** — push evaluation results to your own endpoints

---

## License

The Maru evaluation engine (`engine/`) and SDKs (`sdk-python/`, `sdk-node/`) are open source under the [Apache 2.0 License](./LICENSE).

The Creator Sandbox UI (`ui/`) and enterprise features are proprietary software.  
© 2026 ParallelScore, Inc. All rights reserved.
