from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession
from ..models import Room


def list_rooms(db: DBSession) -> list[Room]:
    return list(db.scalars(select(Room).order_by(Room.name)).all())


def get_room_by_slug(db: DBSession, slug: str) -> Room | None:
    return db.scalar(select(Room).where(Room.slug == slug))
