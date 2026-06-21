from sqlalchemy import select
from app.database import init_db
from app.models import Room


def test_init_db_seeds_six_rooms(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/t.db")
    import importlib
    import app.database as dbmod
    importlib.reload(dbmod)
    dbmod.init_db()
    from sqlalchemy.orm import sessionmaker
    s = sessionmaker(bind=dbmod.engine)()
    rooms = s.scalars(select(Room)).all()
    assert len(rooms) == 6
    assert {r.slug for r in rooms} == {
        "late-night-anxiety", "emo", "joyful-share",
        "vent-anger", "calm-solo", "lost-advice",
    }
