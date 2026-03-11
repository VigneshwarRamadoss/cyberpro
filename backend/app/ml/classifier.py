"""Text classification service for cyberbullying detection.

Uses a transformer-based pipeline with normalized output structure.
In MVP, uses a rule-based fallback if the ML model is not loaded.
"""

import time
import re
from typing import Optional

from app.core.config import settings

# Category keywords for rule-based classification
CATEGORY_PATTERNS = {
    "threat": [r"\bkill\b", r"\bhurt\b", r"\bdie\b", r"\bdead\b", r"\bthreat", r"\bharm\b", r"\bdestroy\b"],
    "hate_speech": [r"\bracis[tm]", r"\bhate\b", r"\bnazi\b", r"\bbigot", r"\bxenophy"],
    "sexual_harassment": [r"\bsex\b.*\bunwant", r"\bgrope", r"\brape\b", r"\bslut\b", r"\bwhore\b"],
    "harassment": [r"\bstalk", r"\bfollow.*\bhome", r"\bwon'?t\s+stop", r"\bleave.*alone"],
    "shaming": [r"\bfat\b", r"\bugly\b", r"\bdisgust", r"\bshame\b", r"\bembarass", r"\bpathetic"],
    "insult": [r"\bstupid\b", r"\bidiot\b", r"\bloser\b", r"\bdumb\b", r"\bmoron\b", r"\btrash\b"],
    "exclusion": [r"\bnobody.*likes", r"\bno\s+friends", r"\bleave\b", r"\balone\b", r"\bunwant"],
    "profanity": [r"\bf+[u*]+c?k", r"\bsh[i*]+t", r"\bass\b", r"\bdamn\b", r"\bhell\b", r"\bbitch"],
}

SEVERITY_MAP = {
    "threat": "critical",
    "hate_speech": "high",
    "sexual_harassment": "critical",
    "harassment": "high",
    "shaming": "medium",
    "insult": "low",
    "exclusion": "medium",
    "profanity": "low",
}

EXPLANATIONS = {
    "threat": "This message contains language that may indicate a threat of physical harm.",
    "hate_speech": "This message contains language that may be classified as hate speech targeting a protected group.",
    "sexual_harassment": "This message contains language that may constitute sexual harassment.",
    "harassment": "This message contains patterns consistent with targeted harassment.",
    "shaming": "This message contains language that appears intended to shame or humiliate.",
    "insult": "This message contains language that may be considered insulting or demeaning.",
    "exclusion": "This message contains language that may be intended to socially exclude someone.",
    "profanity": "This message contains strong language or profanity.",
    "none": "No harmful content detected in this message.",
}

SUGGESTED_ACTIONS = {
    "critical": "This content has been flagged for urgent review. A moderator will assess this soon.",
    "high": "This content has been flagged for moderator review. Consider revising your message.",
    "medium": "This content may contain harmful language. Please review your words and consider their impact.",
    "low": "Minor concerns detected. Please be mindful of your language.",
    "none": "No action needed. This content appears safe.",
}

# Try loading the ML model
_classifier = None
_model_loaded = False


def _load_model():
    """Attempt to load the transformer classifier."""
    global _classifier, _model_loaded
    try:
        from transformers import pipeline
        _classifier = pipeline(
            "text-classification",
            model=settings.MODEL_NAME_TEXT_CLASSIFIER,
            top_k=None,
            truncation=True,
            max_length=512,
        )
        _model_loaded = True
    except Exception:
        _model_loaded = False


def _rule_based_classify(text: str) -> dict:
    """Fallback rule-based classification."""
    text_lower = text.lower()
    detected_categories = []

    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                detected_categories.append(category)
                break

    if not detected_categories:
        return {
            "is_bullying": False,
            "severity": "none",
            "category": "none",
            "confidence_score": 0.85,
            "explanation": EXPLANATIONS["none"],
            "suggested_action": SUGGESTED_ACTIONS["none"],
        }

    # Priority order for categories
    priority_order = [
        "threat", "sexual_harassment", "hate_speech",
        "harassment", "shaming", "exclusion", "insult", "profanity",
    ]

    primary_category = "unknown"
    for cat in priority_order:
        if cat in detected_categories:
            primary_category = cat
            break

    severity = SEVERITY_MAP.get(primary_category, "low")
    match_count = len(detected_categories)
    confidence = min(0.55 + (match_count * 0.12), 0.92)

    return {
        "is_bullying": True,
        "severity": severity,
        "category": primary_category,
        "confidence_score": round(confidence, 4),
        "explanation": EXPLANATIONS.get(primary_category, EXPLANATIONS["none"]),
        "suggested_action": SUGGESTED_ACTIONS.get(severity, SUGGESTED_ACTIONS["none"]),
    }


def _ml_classify(text: str) -> dict:
    """ML-based classification using transformer pipeline."""
    results = _classifier(text)
    if not results:
        return _rule_based_classify(text)

    labels = results[0] if isinstance(results[0], list) else results
    toxic_labels = {r["label"].lower(): r["score"] for r in labels}

    toxic_score = toxic_labels.get("toxic", 0)
    severe_toxic = toxic_labels.get("severe_toxic", 0)
    threat_score = toxic_labels.get("threat", 0)
    insult_score = toxic_labels.get("insult", 0)
    identity_hate = toxic_labels.get("identity_hate", 0)
    obscene = toxic_labels.get("obscene", 0)

    max_score = max(toxic_score, severe_toxic, threat_score, insult_score, identity_hate, obscene)

    if max_score < 0.35:
        return {
            "is_bullying": False,
            "severity": "none",
            "category": "none",
            "confidence_score": round(1 - max_score, 4),
            "explanation": EXPLANATIONS["none"],
            "suggested_action": SUGGESTED_ACTIONS["none"],
        }

    # Map to our category system
    category_map = {
        "threat": ("threat", threat_score),
        "identity_hate": ("hate_speech", identity_hate),
        "severe_toxic": ("harassment", severe_toxic),
        "insult": ("insult", insult_score),
        "obscene": ("profanity", obscene),
        "toxic": ("harassment", toxic_score),
    }

    best_label = max(category_map.items(), key=lambda x: x[1][1])
    category = best_label[1][0]
    confidence = best_label[1][1]

    severity = SEVERITY_MAP.get(category, "low")
    if confidence > 0.85:
        severity_upgrade = {"low": "medium", "medium": "high", "high": "critical"}
        severity = severity_upgrade.get(severity, severity)

    return {
        "is_bullying": True,
        "severity": severity,
        "category": category,
        "confidence_score": round(confidence, 4),
        "explanation": EXPLANATIONS.get(category, EXPLANATIONS["none"]),
        "suggested_action": SUGGESTED_ACTIONS.get(severity, SUGGESTED_ACTIONS["none"]),
    }


def classify_text(text: str) -> dict:
    """Classify text for cyberbullying content.

    Returns normalized output with is_bullying, severity, category,
    confidence_score, explanation, and suggested_action.
    """
    start = time.time()

    if not _model_loaded:
        _load_model()

    if _model_loaded and _classifier:
        try:
            result = _ml_classify(text)
        except Exception:
            result = _rule_based_classify(text)
    else:
        result = _rule_based_classify(text)

    elapsed_ms = int((time.time() - start) * 1000)
    result["processing_ms"] = elapsed_ms
    result["model_version"] = (
        settings.MODEL_NAME_TEXT_CLASSIFIER if _model_loaded else "rule-based-v1"
    )

    return result
