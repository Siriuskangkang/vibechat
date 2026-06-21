import asyncio
import os
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session as DBSession
from ..database import SessionLocal
from ..repositories import room_repo, message_repo
from ..services.identity import gen_nickname, make_avatar
from ..services.mood_field import room_mood, resonance
from ..services.host_service import icebreak, nudge, BOT_WELCOME
from .connection_manager import manager

router = APIRouter()

# 冷场救场：房间安静超过阈值，由「房间主持」自然抛一个低门槛话题。
# DEMO_BOT_TENANT=on 时缩短阈值，保证演示 / 线上验收不冷场。
STALL_SEC = 25 if os.getenv("DEMO_BOT_TENANT") == "on" else 45
_watchdogs: dict[str, asyncio.Task] = {}

GUARDIAN_SLUG = "guardian-haven"


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


async def _send_icebreak(slug: str, room_id: int, room_slug: str, vibe: str, member_emotion: str, recent: list[str]):
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


async def _stall_nudge(slug: str, room_id: int, room_slug: str, vibe: str):
    """冷场 watchdog：安静超过 STALL_SEC 后，由房间主持抛一个话题。
    守护房禁用（那里只需稳定陪伴与求助卡，不该有闲聊救场）；房间已空则不触发。"""
    try:
        await asyncio.sleep(STALL_SEC)
        if not manager.vectors(slug):
            return
        if room_slug == GUARDIAN_SLUG:
            return
        db = SessionLocal()
        try:
            recent = [m.content for m in message_repo.list_messages(db, room_id)[-5:]]
            msg = await nudge(room_slug, vibe, recent)
            message_repo.add_message(db, room_id, None, "ai", "房间主持", msg)
            await manager.broadcast(slug, {
                "type": "host", "sender": "房间主持", "nickname": "房间主持",
                "role": "ai", "content": msg, "ts": _ts(),
            })
        except Exception:
            pass
        finally:
            db.close()
    except asyncio.CancelledError:
        return


def _arm_stall_watchdog(slug: str, room_id: int, room_slug: str, vibe: str):
    """（重新）挂一个冷场 watchdog：进房 / 任何发言后调用，重置计时。"""
    old = _watchdogs.pop(slug, None)
    if old and not old.done():
        old.cancel()
    _watchdogs[slug] = asyncio.create_task(_stall_nudge(slug, room_id, room_slug, vibe))


def _disarm_stall_watchdog(slug: str):
    """房内最后一人离开时取消 watchdog，避免泄漏与空房救场。"""
    if manager.vectors(slug):  # 还有人，保留
        return
    t = _watchdogs.pop(slug, None)
    if t and not t.done():
        t.cancel()


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

        # 冷启动去重：自上次真人发言以来若已有 bot/ai 消息，说明欢迎/破冰已发过，
        # 不再重复——避免用户不说话反复进出同一房间时，bot 欢迎与主持破冰反复堆积。
        all_msgs = message_repo.list_messages(db, room.id)
        last_human_idx = max((i for i, m in enumerate(all_msgs) if m.sender_role == "user"), default=-1)
        already_greeted = any(m.sender_role in ("bot", "ai") for m in all_msgs[last_human_idx + 1:])

        if len(manager.vectors(slug)) <= 1 and not already_greeted:
            bot_content = BOT_WELCOME.get(room.slug, "这儿不只有你，慢慢说。")
            message_repo.add_message(db, room.id, None, "bot", "匿名居民", bot_content)
            await manager.broadcast(slug, {
                "type": "message", "sender": "匿名居民", "nickname": "匿名居民",
                "role": "bot", "content": bot_content, "ts": _ts(),
            })

        recent_msgs = [m.content for m in all_msgs[-5:]]
        member_emotion = "积极" if vector[0] >= 0 else "消极"
        if not already_greeted:
            asyncio.create_task(_send_icebreak(slug, room.id, room.slug, room.vibe, member_emotion, recent_msgs))
        # 进房即挂冷场兜底（守护房会在 _stall_nudge 内自行跳过）
        _arm_stall_watchdog(slug, room.id, room.slug, room.vibe)

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
                # 有人发言，重置冷场计时
                _arm_stall_watchdog(slug, room.id, room.slug, room.vibe)
    except WebSocketDisconnect:
        pass
    finally:
        manager.leave(slug, websocket)
        _disarm_stall_watchdog(slug)
        try:
            await _broadcast_state(slug)
        except Exception:
            pass
        db.close()
