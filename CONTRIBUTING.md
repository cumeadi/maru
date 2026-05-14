# Contributing to Maru

Thank you for your interest in improving Maru! This document explains how to contribute to the open-source core of the Maru evaluation engine.

## Open Source Boundary

| What's open | What's not |
|---|---|
| `engine/` — FastAPI evaluation engine | Creator Sandbox UI (`ui/`) |
| `sdk-python/` — Python client | Managed Cloud hosting |
| `sdk-node/` — Node.js/TypeScript client | Enterprise telemetry features |

Please only submit PRs against `engine/`, `sdk-python/`, or `sdk-node/`.

---

## What We Welcome

- **New rubric templates** — real-world patterns for new use cases (e.g. code review, multilingual support, medical safety)
- **Heuristic improvements** — faster deterministic pre-checks that save LLM cost
- **SDK language ports** — Go, Ruby, Java, etc.
- **Model connector fixes** — LiteLLM adapter bugs for specific providers
- **Bug reports** with a minimal repro script

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker + Docker Compose

### Engine (FastAPI)

```bash
# Clone and set up the engine
git clone https://github.com/parallelscor/maru.git
cd maru

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your OPENAI_API_KEY (or other provider key)

# Start Postgres via Docker
docker-compose up postgres -d

# Install engine dependencies
cd engine
pip install -e ".[dev]"

# Run the server
uvicorn api.main:app --reload --port 8000

# Run the verification test suite
python3 tests/test_verification.py
```

### Python SDK

```bash
cd sdk-python
pip install -e .
```

### Node.js SDK

```bash
cd sdk-node
npm install
npm run build
npm test
```

---

## Adding a Rubric Template

1. Open `engine/core/rubrics.py`
2. Add a new `Rubric(...)` instance following the existing pattern:

```python
MY_TEMPLATE = Rubric(
    id="my-use-case",
    name="Human-Readable Name",
    criteria=[
        RubricCriterion(
            name="Criterion Name",
            description="What the judge should look for.",
            criterion_type="pass_fail",  # or "score_1_to_10" or "penalty"
            weight=1.0,
        ),
    ],
)
```

3. Register it in the `ALL_TEMPLATES` dict at the bottom of the file
4. Add a brief test in `engine/tests/test_verification.py`
5. Open a PR with:
   - The use case your template targets
   - An example prompt/output pair it should correctly evaluate

---

## Pull Request Guidelines

- Keep PRs focused — one rubric template or one bug fix per PR
- Include a test or repro script
- Follow the existing code style (Pydantic v2, async FastAPI, no print statements in production paths)
- Sign off your commits: `git commit -s`

---

## Reporting Bugs

Open a GitHub issue with:
- Engine version (`/health` endpoint returns it)
- Python/Node version
- Minimal script that reproduces the issue
- Expected vs actual output

---

## License

By contributing, you agree that your contributions will be licensed under the [Apache 2.0 License](./LICENSE).
