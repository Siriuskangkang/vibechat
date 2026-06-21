from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..repositories import room_repo, message_repo, emotion_repo
from ..services import host_service

router = APIRouter()


@router.get("/rooms")
async def list_rooms(db: DBSession = Depends(get_db)):
    rooms = room_repo.list_rooms(db)
    return {"code": 0, "message": "ok", "data": [
        {"slug": r.slug, "name": r.name, "color": r.color, "description": r.description}
        for r in rooms
    ]}


@router.get("/rooms/{slug}/messages")
async def list_messages(slug: str, db: DBSession = Depends(get_db)):
    room = room_repo.get_room_by_slug(db, slug)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")
    msgs = message_repo.list_messages(db, room.id)
    return {"code": 0, "message": "ok", "data": [
        {"sender": m.nickname, "nickname": m.nickname, "role": m.sender_role,
         "content": m.content, "ts": int(m.created_at.timestamp() * 1000)}
        for m in msgs
    ]}


class LeaveRequest(BaseModel):
    session_id: str
    dialogue: str = ""


@router.post("/rooms/{slug}/leave")
async def leave_room(slug: str, payload: LeaveRequest, db: DBSession = Depends(get_db)):
    room = room_repo.get_room_by_slug(db, slug)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")
    latest = emotion_repo.get_latest_by_session(db, payload.session_id)
    member_emotion = latest.primary if latest else ""
    start_vector = latest.vector if latest else [0.0, 0.0, 0.0, 0.0]
    result = await host_service.summarize(member_emotion, room.name, payload.dialogue)
    return {
        "code": 0, "message": "ok",
        "data": {
            "summary": result["summary"],
            "takeaway": result["takeaway"],
            "mood_end": result["mood_end"],
            "start_vector": start_vector,
        },
    }
