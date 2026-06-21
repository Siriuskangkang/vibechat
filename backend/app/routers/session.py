import uuid
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session as DBSession
from ..database import get_db
from ..repositories import session_repo

router = APIRouter()


@router.post("/session")
async def create_session(request: Request, response: Response, db: DBSession = Depends(get_db)):
    sid = request.cookies.get("sid") or str(uuid.uuid4())
    s = session_repo.get_or_create_session(db, sid)
    response.set_cookie("sid", s.id, httponly=True, samesite="lax", max_age=60 * 60 * 24 * 30)
    return {"code": 0, "message": "ok", "data": {"session_id": s.id}}
