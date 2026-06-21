from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..repositories import room_repo, message_repo

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
