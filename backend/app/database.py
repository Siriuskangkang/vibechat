import json
from pathlib import Path
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from .core.config import settings
from .models import Base, Room

_connect = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=_connect)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    seed_rooms()


def seed_rooms():
    db = SessionLocal()
    try:
        if db.scalar(select(Room).limit(1)):
            return
        seed_path = Path(__file__).parent / "seeds" / "rooms.seed.json"
        for r in json.loads(seed_path.read_text(encoding="utf-8")):
            db.add(Room(**r))
        db.commit()
    finally:
        db.close()
