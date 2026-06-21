from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..schemas import AnalyzeRequest
from ..services.emotion_service import analyze_emotion
from ..services.matching import match_rooms
from ..services.safety import has_risk
from ..repositories import emotion_repo, room_repo

router = APIRouter()


def _emotion_out(d: dict) -> dict:
    return {
        "primary": d["primary"], "secondary": d.get("secondary", []),
        "valence": d["valence"], "arousal": d["arousal"],
        "intensity": d["intensity"], "social": d["social"],
        "vector": d["vector"], "keywords": d.get("keywords", []),
        "reading": d["reading"], "risk_flag": d.get("risk_flag", False),
        "provider": d.get("provider", ""),
    }


@router.post("/emotion/analyze")
async def analyze(payload: AnalyzeRequest, request: Request, db: DBSession = Depends(get_db)):
    sid = request.cookies.get("sid")
    if not sid:
        raise HTTPException(status_code=401, detail="会话未初始化，请先调用 /api/session")

    data = await analyze_emotion(payload.text)
    emotion_repo.save_analysis(db, sid, {**data, "input_text": payload.text})

    rooms = [
        {"slug": r.slug, "name": r.name, "color": r.color,
         "description": r.description, "anchor_vector": r.anchor_vector}
        for r in room_repo.list_rooms(db)
    ]
    scored = match_rooms(data["vector"], rooms)
    top = scored[0]

    return {
        "code": 0, "message": "ok",
        "data": {
            "emotion": _emotion_out(data),
            "room": {"slug": top["slug"], "name": top["name"],
                     "color": top["color"], "description": top["description"]},
            "affinity": top["affinity"],
            "alternatives": [
                {"slug": x["slug"], "name": x["name"], "color": x["color"], "affinity": x["affinity"]}
                for x in scored[1:4]
            ],
            "help_needed": has_risk(payload.text, data.get("risk_flag", False)),
        },
    }
