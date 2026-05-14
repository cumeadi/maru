import httpx
import threading
from typing import Optional, Literal


class TEMPLATES:
    """
    Constants for pre-built rubric template IDs.
    Use with maru.get_templates() for IDE autocomplete and safe references.

    Example:
        templates = maru.get_templates()
        rubric = templates[TEMPLATES.RAG_HALLUCINATION]
    """
    RAG_HALLUCINATION = "rag-hallucination"
    JSON_STRICT       = "json-strict"
    SUPPORT_TONE      = "support-tone"
    TOXICITY_FILTER   = "toxicity-filter"


class MaruClient:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url
        self._headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def evaluate(self, prompt: str, output: str, rubric: dict, judge_model: str = "gpt-4o") -> dict:
        """Run a blocking evaluation and return the full result."""
        payload = {"prompt": prompt, "output": output, "rubric": rubric, "judge_model": judge_model}
        response = httpx.post(f"{self.base_url}/api/v1/evaluate", json=payload, headers=self._headers)
        response.raise_for_status()
        return response.json()

    def test(self, prompt: str, output: str, rubric: dict, threshold: float = 90.0) -> bool:
        """
        CI/CD assertion. Returns True if evaluation passes the threshold.
        Prints per-criterion CoT on failure and returns False to fail the build.

        Example (GitHub Actions):
            if not maru.test(prompt, output, rubric, threshold=90.0):
                sys.exit(1)
        """
        result = self.evaluate(prompt, output, rubric)
        if not result.get("passed") or result.get("overall_score", 0) < threshold:
            print(f"[Maru] ✗ Test Failed — Score: {result.get('overall_score')}/{threshold}")
            for c in result.get("criteria_results", []):
                status = "✓" if c.get("passed") else "✗"
                print(f"  {status} {c.get('criterion_name')}: {c.get('reasoning')}")
            return False
        print(f"[Maru] ✓ Test Passed — Score: {result.get('overall_score')}/{threshold}")
        return True

    def shadow_test(self, prompt: str, output: str, rubric: dict, judge_model: str = "gpt-4o") -> None:
        """
        Shadow Mode: fire-and-forget evaluation on live traffic.
        Dispatches in a daemon thread — zero latency impact on the caller.
        """
        def _fire():
            try:
                payload = {
                    "prompt": prompt, "output": output,
                    "rubric": rubric, "judge_model": judge_model,
                    "is_shadow": True
                }
                httpx.post(f"{self.base_url}/api/v1/evaluate", json=payload, headers=self._headers)
            except Exception as e:
                print(f"[Maru Shadow] Warning: background evaluation failed silently — {e}")

        thread = threading.Thread(target=_fire, daemon=True)
        thread.start()

    def log_feedback(
        self,
        run_id: str,
        action: Literal["accepted", "rejected", "regenerated", "edited"],
        note: Optional[str] = None
    ) -> dict:
        """
        Log implicit user feedback (e.g. thumbs down, regenerate click) correlated
        to an evaluation run_id to close the loop between judge scores and reality.
        """
        payload = {"run_id": run_id, "action": action, "note": note}
        response = httpx.post(f"{self.base_url}/api/v1/feedback", json=payload, headers=self._headers)
        response.raise_for_status()
        return response.json()

    def get_templates(self) -> dict:
        """
        Fetch all available pre-built rubric templates from the engine.

        Use TEMPLATES constants for safe ID references:
            rubric = templates[TEMPLATES.SUPPORT_TONE]
        """
        response = httpx.get(f"{self.base_url}/api/v1/rubrics/templates", headers=self._headers)
        response.raise_for_status()
        return response.json()
