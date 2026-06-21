from sqlalchemy.orm import Session as DBSession
from ..models import Session


def get_or_create_session(db: DBSession, session_id: str | None) -> Session:
    if session_id:
        s = db.get(Session, session_id)
        if s:
            return s
        s = Session(id=session_id)
    else:
        s = Session()
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
