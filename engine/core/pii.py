import re

# PII patterns mapped to redaction labels
PII_PATTERNS = [
    (re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'), '[REDACTED_EMAIL]'),
    (re.compile(r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b'), '[REDACTED_SSN]'),
    (re.compile(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'), '[REDACTED_CARD]'),
    (re.compile(r'\b(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b'), '[REDACTED_PHONE]'),
    (re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'), '[REDACTED_IP]'),
]

def redact_pii(text: str) -> tuple[str, list[str]]:
    """
    Scans input text and replaces PII with redaction labels.
    Returns the cleaned text and a list of redaction types that were applied.
    """
    redacted = text
    applied = []
    for pattern, label in PII_PATTERNS:
        if pattern.search(redacted):
            redacted = pattern.sub(label, redacted)
            applied.append(label)
    return redacted, applied
