from sqlalchemy.orm import Session as DBSession
from ..models import EmotionAnalysis


def save_analysis(db: DBSession, session_id: str, data: dict) -> EmotionAnalysis:
    ea = EmotionAnalysis(
        session_id=session_id,
        input_text=data.get("input_text", ""),
        primary=data["primary"],
        secondary=data.get("secondary", []),
        valence=data["valence"], arousal=data["arousal"],
        intensity=data["intensity"], social=data["social"],
        vector=data["vector"], keywords=data.get("keywords", []),
        reading=data["reading"], risk_flag=data.get("risk_flag", False),
        provider=data.get("provider", ""), model=data.get("model", ""),
    )
    db.add(ea)
    db.commit()
    db.refresh(ea)
    return ea
