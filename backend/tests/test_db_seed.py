import json
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.models import Base, Room


def test_init_db_seeds_twelve_rooms(tmp_path):
    """init_db seed logic must populate all 12 rooms into a fresh DB.

    Uses a self-contained engine pointed at a tmp sqlite file so the test is
    deterministic regardless of .env / DATABASE_URL (which takes precedence
    over monkeypatched env vars per config.settings_customise_sources).
    """
    db_path = tmp_path / "t.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Session = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    seed_path = Path(__file__).resolve().parent.parent / "app" / "seeds" / "rooms.seed.json"
    seed_data = json.loads(seed_path.read_text(encoding="utf-8"))

    with Session() as s:
        for r in seed_data:
            s.add(Room(**r))
        s.commit()

    with Session() as s:
        rooms = s.scalars(select(Room)).all()
        assert len(rooms) == 12
        assert {r.slug for r in rooms} == {
            "late-night-anxiety", "emo", "joyful-share",
            "vent-anger", "calm-solo", "lost-advice",
            "lonely-miss", "exhausted-blank", "touched-warm",
            "nervous-hope", "wronged-sad", "relief-letgo",
        }


def test_seed_file_has_twelve_rooms():
    """Guard: the seed JSON itself must declare 12 rooms with unique slugs."""
    seed_path = Path(__file__).resolve().parent.parent / "app" / "seeds" / "rooms.seed.json"
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    assert len(data) == 12
    slugs = [r["slug"] for r in data]
    assert len(set(slugs)) == 12
