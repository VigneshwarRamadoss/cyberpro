"""Seed script to populate the database with demo data."""

import random
import uuid
from datetime import datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models.models import (
    Analysis, AudioUpload, Base, Incident, IncidentAuditLog,
    User, UserWarningEvent,
)

DEMO_TEXTS = {
    "safe": [
        "Hey, great job on the presentation today!",
        "Can we meet after class to discuss the project?",
        "I really enjoyed the game last night.",
        "Thanks for helping me with my homework.",
        "Happy birthday! Hope you have a wonderful day.",
        "The weather is really nice today, want to go for a walk?",
        "I appreciate your feedback on my essay.",
        "Good luck on your exam tomorrow!",
    ],
    "insult": [
        "You're such a loser, nobody wants to be your friend.",
        "That was the dumbest thing I've ever heard anyone say.",
        "You're so stupid, you can't even do basic math.",
    ],
    "harassment": [
        "I'm going to make sure everyone knows what you did. You can't hide.",
        "I won't stop until you leave this school. You don't belong here.",
    ],
    "threat": [
        "You better watch your back after school today.",
        "I'm going to hurt you if you show up tomorrow.",
    ],
    "hate_speech": [
        "People like you don't deserve to be in our group. Go back where you came from.",
    ],
    "shaming": [
        "Look at what you're wearing, you look so ugly and pathetic.",
        "Everyone is laughing at you behind your back, you're an embarrassment.",
    ],
    "exclusion": [
        "Nobody wants you here. You have no friends and nobody likes you.",
    ],
    "profanity": [
        "What the hell is wrong with you? You're such a damn fool.",
    ],
}

SEVERITY_MAP = {
    "safe": "none",
    "insult": "low",
    "profanity": "low",
    "shaming": "medium",
    "exclusion": "medium",
    "harassment": "high",
    "threat": "critical",
    "hate_speech": "high",
}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(User).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        # Create admin user
        admin = User(
            id=uuid.uuid4(),
            full_name="Admin User",
            email="admin@shieldspeak.com",
            password_hash=hash_password("admin123!"),
            role="admin",
        )
        db.add(admin)

        # Create demo users
        demo_users = []
        user_data = [
            ("Alex Rivera", "alex@demo.com"),
            ("Jordan Chen", "jordan@demo.com"),
            ("Sam Patel", "sam@demo.com"),
            ("Casey Morgan", "casey@demo.com"),
            ("Taylor Kim", "taylor@demo.com"),
        ]

        for name, email in user_data:
            user = User(
                id=uuid.uuid4(),
                full_name=name,
                email=email,
                password_hash=hash_password("demo123!"),
                role="user",
            )
            db.add(user)
            demo_users.append(user)

        db.flush()

        # Create analyses
        analyses = []
        now = datetime.now(timezone.utc)

        for i in range(30):
            # Text analyses
            user = random.choice(demo_users)
            category = random.choice(list(DEMO_TEXTS.keys()))
            text = random.choice(DEMO_TEXTS[category])
            severity = SEVERITY_MAP[category]
            is_bullying = category != "safe"
            confidence = round(random.uniform(0.6, 0.95), 4) if is_bullying else round(random.uniform(0.8, 0.98), 4)

            analysis = Analysis(
                id=uuid.uuid4(),
                user_id=user.id,
                source_type="text",
                original_text=text,
                status="completed",
                is_bullying=is_bullying,
                severity=severity,
                category=category if is_bullying else "none",
                confidence_score=confidence,
                explanation=f"Analysis detected {'potential ' + category if is_bullying else 'no harmful content'}.",
                suggested_action="No action needed." if not is_bullying else f"Content flagged for {severity} severity review.",
                model_version="rule-based-v1",
                processing_ms=random.randint(50, 800),
                created_at=now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
            )
            db.add(analysis)
            analyses.append((analysis, is_bullying, severity, category, user))

        # Create 10 voice analyses
        for i in range(10):
            user = random.choice(demo_users)
            category = random.choice(["safe", "insult", "harassment", "shaming"])
            text = random.choice(DEMO_TEXTS[category])
            severity = SEVERITY_MAP[category]
            is_bullying = category != "safe"
            confidence = round(random.uniform(0.55, 0.90), 4)

            analysis = Analysis(
                id=uuid.uuid4(),
                user_id=user.id,
                source_type="voice",
                transcript_text=text,
                status="completed",
                is_bullying=is_bullying,
                severity=severity,
                category=category if is_bullying else "none",
                confidence_score=confidence,
                explanation=f"Voice transcript analysis: {'potential ' + category + ' detected' if is_bullying else 'no concerns found'}.",
                suggested_action="No action needed." if not is_bullying else f"Content flagged for review.",
                model_version="rule-based-v1",
                processing_ms=random.randint(1000, 5000),
                created_at=now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23)),
            )
            db.add(analysis)
            analyses.append((analysis, is_bullying, severity, category, user))

        db.flush()

        # Create incidents for flagged content
        incident_count = 0
        for analysis, is_bullying, severity, category, user in analyses:
            if is_bullying and severity in ("medium", "high", "critical"):
                risk_base = {"medium": 50, "high": 75, "critical": 92}
                risk = risk_base.get(severity, 40) + random.uniform(-5, 10)
                risk = min(max(risk, 35), 100)

                escalation = "warning"
                if risk >= 85:
                    escalation = "urgent_review"
                elif risk >= 65:
                    escalation = "admin_review"

                statuses = ["open", "in_review", "resolved", "dismissed"]
                weights = [0.4, 0.2, 0.3, 0.1]
                review_status = random.choices(statuses, weights=weights, k=1)[0]

                action = "none"
                if review_status in ("resolved", "dismissed"):
                    actions = ["warned_user", "escalated", "monitored", "false_positive"]
                    action = random.choice(actions)

                incident = Incident(
                    id=uuid.uuid4(),
                    analysis_id=analysis.id,
                    user_id=user.id,
                    risk_score=round(risk, 2),
                    escalation_level=escalation,
                    review_status=review_status,
                    assigned_admin_id=admin.id if review_status != "open" else None,
                    action_taken=action,
                    admin_notes="Reviewed and addressed." if review_status == "resolved" else None,
                    reviewed_at=now - timedelta(days=random.randint(0, 5)) if review_status in ("resolved", "dismissed") else None,
                    created_at=analysis.created_at + timedelta(seconds=random.randint(1, 60)),
                )
                db.add(incident)
                incident_count += 1

                if incident_count <= 12:
                    continue

        db.flush()

        # Create some warning events
        for analysis, is_bullying, severity, category, user in analyses:
            if is_bullying and severity in ("medium", "high", "critical"):
                messages = {
                    "medium": "This message may contain language that could be hurtful.",
                    "high": "This message has been flagged for potentially harmful content.",
                    "critical": "This message contains high-risk content and has been escalated.",
                }
                warning = UserWarningEvent(
                    user_id=user.id,
                    analysis_id=analysis.id,
                    severity=severity,
                    warning_message=messages.get(severity, ""),
                )
                db.add(warning)

        db.commit()
        print(f"Seeded: 1 admin, {len(demo_users)} users, {len(analyses)} analyses, {incident_count} incidents")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
