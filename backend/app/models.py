import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    nickname: Mapped[str | None] = mapped_column(String(64), nullable=True)
    avatar: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class EmotionAnalysis(Base):
    __tablename__ = "emotion_analyses"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), index=True)
    input_text: Mapped[str] = mapped_column(Text)
    primary: Mapped[str] = mapped_column(String(32))
    secondary: Mapped[list] = mapped_column(JSON, default=list)
    valence: Mapped[float] = mapped_column(Float)
    arousal: Mapped[float] = mapped_column(Float)
    intensity: Mapped[float] = mapped_column(Float)
    social: Mapped[float] = mapped_column(Float)
    vector: Mapped[list] = mapped_column(JSON)
    keywords: Mapped[list] = mapped_column(JSON, default=list)
    reading: Mapped[str] = mapped_column(Text)
    risk_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    provider: Mapped[str] = mapped_column(String(16), default="openai")
    model: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)


class Room(Base):
    __tablename__ = "rooms"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(48), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(48))
    description: Mapped[str] = mapped_column(Text)
    anchor_vector: Mapped[list] = mapped_column(JSON)
    color: Mapped[str] = mapped_column(String(16))
    vibe: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class RoomMembership(Base):
    __tablename__ = "room_memberships"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"), index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), index=True)
    nickname: Mapped[str] = mapped_column(String(64))
    avatar: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    vector: Mapped[list] = mapped_column(JSON)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"), index=True)
    session_id: Mapped[str | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    sender_role: Mapped[str] = mapped_column(String(8))
    nickname: Mapped[str] = mapped_column(String(64))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)
