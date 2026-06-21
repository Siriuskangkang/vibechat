from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession
from ..models import Message


def list_messages(db: DBSession, room_id: str, limit: int = 50) -> list[Message]:
    rows = list(db.scalars(
        select(Message).where(Message.room_id == room_id)
        .order_by(Message.created_at.desc()).limit(limit)
    ).all())
    return rows[::-1]


def add_message(db: DBSession, room_id: str, session_id: str | None,
                sender_role: str, nickname: str, content: str) -> Message:
    m = Message(room_id=room_id, session_id=session_id,
                sender_role=sender_role, nickname=nickname, content=content)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m
