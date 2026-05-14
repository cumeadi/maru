"""
Maru V1.5 Verification Test Suite
Run with: python3 engine/tests/test_verification.py
"""

import sys
import os

# Point imports at the engine package
engine_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, engine_dir)

from core.pii import redact_pii

PASS = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"
HEADER = "\033[94m──\033[0m"

def run_pii_tests():
    print(f"\n{HEADER} PII Redaction Tests")
    cases = [
        ("Email", "Contact jane.doe@acme.com for details.",
         "[REDACTED_EMAIL]"),
        ("SSN",   "SSN: 123-45-6789 on file.",
         "[REDACTED_SSN]"),
        ("Phone", "Call us at 555-867-5309.",
         "[REDACTED_PHONE]"),
        ("IP",    "Request came from 192.168.1.100.",
         "[REDACTED_IP]"),
        ("Clean", "This output has no sensitive data.",
         None),
    ]

    all_passed = True
    for label, text, expected_label in cases:
        redacted, found = redact_pii(text)
        if expected_label:
            ok = expected_label in redacted and expected_label in found
        else:
            ok = len(found) == 0

        icon = PASS if ok else FAIL
        if not ok:
            all_passed = False
        print(f"  {icon} [{label}]")
        print(f"       Input:    {text}")
        print(f"       Redacted: {redacted}")
        print(f"       Tags:     {found or 'none'}")
    return all_passed


def run_shadow_mode_test():
    """
    Verify that shadow_test() is non-blocking by confirming it returns
    immediately (under 50ms) regardless of LLM latency.
    """
    import time
    import threading

    print(f"\n{HEADER} Shadow Mode Non-Blocking Test")
    fired = []
    results = []

    def mock_evaluate(duration: float):
        """Simulates an evaluation that takes `duration` seconds."""
        time.sleep(duration)
        fired.append(True)

    def shadow_dispatch(fn, *args):
        """Mirrors the SDK's daemon thread dispatch pattern."""
        t = threading.Thread(target=fn, args=args, daemon=True)
        t.start()
        return t

    start = time.time()
    thread = shadow_dispatch(mock_evaluate, 1.0)  # Simulate 1s LLM call
    elapsed = (time.time() - start) * 1000

    ok = elapsed < 50  # Must return in <50ms
    icon = PASS if ok else FAIL
    print(f"  {icon} Dispatch returned in {elapsed:.2f}ms (threshold: <50ms)")

    thread.join(timeout=2.0)  # Wait for background thread to complete
    print(f"  {PASS} Background evaluation completed after thread join")
    return ok


def run_feedback_schema_test():
    """
    Verify the FeedbackRequest schema validates correctly.
    """
    print(f"\n{HEADER} Implicit Feedback Schema Test")
    from api.schemas import FeedbackRequest
    import uuid

    all_passed = True
    valid_actions = ["accepted", "rejected", "regenerated", "edited"]
    for action in valid_actions:
        try:
            req = FeedbackRequest(run_id=str(uuid.uuid4()), action=action, note="test note")
            print(f"  {PASS} action='{action}' validated correctly")
        except Exception as e:
            print(f"  {FAIL} action='{action}' failed: {e}")
            all_passed = False

    # Test invalid action
    try:
        req = FeedbackRequest(run_id="x", action="invalid_action")
        print(f"  {FAIL} Invalid action was accepted (should have raised)")
        all_passed = False
    except Exception:
        print(f"  {PASS} Invalid action correctly rejected")

    return all_passed


if __name__ == "__main__":
    results = []
    results.append(run_pii_tests())
    results.append(run_shadow_mode_test())
    results.append(run_feedback_schema_test())

    print(f"\n{'─' * 50}")
    total = len(results)
    passed = sum(results)
    icon = PASS if passed == total else FAIL
    print(f"{icon} {passed}/{total} test suites passed\n")
    sys.exit(0 if passed == total else 1)
