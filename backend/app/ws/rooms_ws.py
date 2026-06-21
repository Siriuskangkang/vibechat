import asyncio
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session as DBSession
from ..database import SessionLocal
from ..repositories import room_repo, message_repo
from ..services.identity import gen_nickname, make_avatar
from ..services.mood_field import room_mood, resonance
from ..services.host_service import icebreak, BOT_WELCOME
from .connection_manager import manager

router = APIRouter()


def _ts() -> int:
    return int(time.time() * 1000)


async def _broadcast_state(slug: str):
    vecs = manager.vectors(slug)
    await manager.broadcast(slug, {"type": "presence", "online": len(vecs)})
    await manager.broadcast(slug, {
        "type": "room_mood",
        "vector": room_mood(vecs),
        "resonance": round(resonance(vecs), 2),
        "online": len(vecs),
    })


async def _send_icebreak(slug: str, room_id: str, room_slug: str, vibe: str, member_emotion: str, recent: list[str]):
    try:
        msg = await icebreak(room_slug, vibe, member_emotion, recent)
        # 独立 db session 落库（避免与 ws 的 db 生命周期冲突）
        db = SessionLocal()
        try:
            message_repo.add_message(db, room_id, None, "ai", "房间主持", msg)
        finally:
            db.close()
        await manager.broadcast(slug, {
            "type": "host", "sender": "房间主持", "nickname": "房间主持",
            "role": "ai", "content": msg, "ts": _ts(),
        })
    except Exception:
        pass


@router.websocket("/api/ws/room/{slug}")
async def room_ws(websocket: WebSocket, slug: str):
    db: DBSession = SessionLocal()
    room = room_repo.get_room_by_slug(db, slug)
    if not room:
        await websocket.accept()
        await websocket.close(code=1008)
        db.close()
        return

    await websocket.accept()
    try:
        init = await websocket.receive_json()
        session_id = init.get("session_id", "")
        vector = init.get("vector") or [0.0, 0.0, 0.0, 0.0]

        used = {m.nickname for m in message_repo.list_messages(db, room.id)}
        nickname = gen_nickname(slug, session_id, used)
        avatar = make_avatar(session_id, slug, vector[0], vector[1])
        await manager.join(slug, websocket, {"nickname": nickname, "avatar": avatar, "vector": vector})

        await manager.broadcast(slug, {"type": "member_join", "nickname": nickname, "avatar": avatar})
        await _broadcast_state(slug)

        # 推送历史给新成员（含之前落库的真人/主持/bot 消息）
        for m in message_repo.list_messages(db, room.id):
            await websocket.send_json({
                "type": "history",
                "nickname": m.nickname,
                "role": m.sender_role,
                "content": m.content,
                "ts": int(m.created_at.timestamp() * 1000),
            })

        if len(manager.vectors(slug)) <= 1:
            bot_content = BOT_WELCOME.get(room.slug, "这儿不只有你，慢慢说。")
            message_repo.add_message(db, room.id, None, "bot", "匿名居民", bot_content)
            await manager.broadcast(slug, {
                "type": "message", "sender": "匿名居民", "nickname": "匿名居民",
                "role": "bot", "content": bot_content, "ts": _ts(),
            })

        recent_msgs = [m.content for m in message_repo.list_messages(db, room.id)[-5:]]
        member_emotion = "积极" if vector[0] >= 0 else "消极"
        asyncio.create_task(_send_icebreak(slug, room.id, room.slug, room.vibe, member_emotion, recent_msgs))

        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                content = (data.get("content") or "").strip()
                if not content:
                    continue
                message_repo.add_message(db, room.id, session_id, "user", nickname, content)
                await manager.broadcast(slug, {
                    "type": "message", "sender": nickname, "nickname": nickname,
                    "role": "user", "content": content, "ts": _ts(), "avatar": avatar,
                }, exclude=websocket)
    except WebSocketDisconnect:
        pass
    finally:
        manager.leave(slug, websocket)
        try:
            await _broadcast_state(slug)
        except Exception:
            pass
        db.close()
