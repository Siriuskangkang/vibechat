# M5 · AI 主持 · 安全

> **目标**：AI 房间主持工作流（破冰 / 离场总结，确定性 workflow + 降级）、兜底 bot（独处时招呼）、求助链路确认。离场总结复用一次 LLM 同时产出 `mood_end`（供 M6 情绪旅程）。
> **产出**：`services/host_service.py`、离场端点、WS 兜底 bot。
> **前置**：M4 完成。

---

## Task 20: host_service 工作流（mock LLM 测试）

**Files:**
- Create: `backend/app/services/host_service.py`
- Create: `backend/tests/test_host_service.py`

- [ ] **Step 1: 写失败测试 backend/tests/test_host_service.py**

```python
from app.llm.base import LLMResponse
from app.services import host_service


class IcebreakLLM:
    async def chat(self, system, user, *, json_schema=None, **kw):
        return LLMResponse(content="{}", raw_json={"message": "测试破冰语"}, usage={}, provider="t", model="t")


class SummaryLLM:
    async def chat(self, system, user, *, json_schema=None, **kw):
        return LLMResponse(content="{}", raw_json={
            "summary": "你今晚被汇报压着", "takeaway": "说出来就轻了一点",
            "mood_end": {"valence": -0.3, "arousal": 0.4},
        }, usage={}, provider="t", model="t")


class FailLLM:
    async def chat(self, *a, **kw):
        raise RuntimeError("boom")


async def test_icebreak_normal(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: IcebreakLLM())
    assert await host_service.icebreak("emo", "低沉", "低落", []) == "测试破冰语"


async def test_icebreak_fallback(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: FailLLM())
    msg = await host_service.icebreak("emo", "低沉", "低落", [])
    assert msg == host_service.ICEBREAK_FALLBACK["emo"]


async def test_summarize_has_mood_end(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: SummaryLLM())
    r = await host_service.summarize("焦虑", "深夜焦虑", "睡不着")
    assert r["mood_end"] == {"valence": -0.3, "arousal": 0.4}
    assert "summary" in r and "takeaway" in r


async def test_summarize_fallback(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: FailLLM())
    r = await host_service.summarize("焦虑", "深夜焦虑", "睡不着")
    assert "mood_end" in r and "summary" in r
```

- [ ] **Step 2: 跑测试见失败**

- [ ] **Step 3: 写实现 backend/app/services/host_service.py**

```python
from ..llm.factory import get_llm

ICEBREAK_SYSTEM = (
    "你是匿名情绪房间的温和主持。用第二人称、克制、不评判的语气，"
    "只输出符合 schema 的 JSON。"
)
SUMMARY_SYSTEM = (
    "你是匿名情绪房间的温和主持。基于用户在本房的对话与情绪，给一个温柔的情绪小总结，"
    "只输出符合 schema 的 JSON。"
)

ICEBREAK_FALLBACK = {
    "late-night-anxiety": "这间房的人都被某件事压着，说说你正在面对什么？",
    "emo": "不用急着说话，待着也行。",
    "joyful-share": "有开心事就抖出来吧，这间房专收好消息。",
    "vent-anger": "被什么气到了？先说为敬，我们听着。",
    "calm-solo": "今天挺安静的，想随便聊聊还是就待会儿？",
    "lost-advice": "卡住了？说说你正纠结的事，大家帮你捋一捋。",
}
BOT_WELCOME = {
    "late-night-anxiety": "这儿不只有你，深夜醒着的人都在。",
    "emo": "没关系，这儿允许低落。",
    "joyful-share": "来，把好消息放这儿。",
    "vent-anger": "气就气，我们不评判。",
    "calm-solo": "安静地待着，也挺好。",
    "lost-advice": "迷茫的时候，说出来会清楚一点。",
}


async def icebreak(slug: str, vibe: str, member_emotion: str, recent: list[str]) -> str:
    user = f"房间氛围：{vibe}；新成员情绪：{member_emotion}；最近对话：{recent}"
    prompt = user + '\n要求输出：{"message": str≤40字}'
    try:
        llm = get_llm()
        resp = await llm.chat(ICEBREAK_SYSTEM, prompt, json_schema={"type": "object"})
        if resp.raw_json and resp.raw_json.get("message"):
            return str(resp.raw_json["message"])[:80]
        raise ValueError("no message")
    except Exception:
        return ICEBREAK_FALLBACK.get(slug, "欢迎来到这间房，想说什么都可以。")


async def summarize(member_emotion: str, room_name: str, dialogue: str) -> dict:
    user = f"用户进房情绪：{member_emotion}；房间：{room_name}；对话：{dialogue}"
    prompt = user + '\n要求输出：{"summary": str≤50字, "takeaway": str≤20字, "mood_end": {"valence": float, "arousal": float}}'
    try:
        llm = get_llm()
        resp = await llm.chat(SUMMARY_SYSTEM, prompt, json_schema={"type": "object"})
        if resp.raw_json and "summary" in resp.raw_json:
            data = resp.raw_json
            data.setdefault("mood_end", {"valence": 0.0, "arousal": 0.3})
            data.setdefault("takeaway", "被听见本身就是一种接住。")
            return data
        raise ValueError("no summary")
    except Exception:
        return {
            "summary": f"你在『{room_name}』待了一会儿，希望此刻轻了一点。",
            "takeaway": "被听见本身就是一种接住。",
            "mood_end": {"valence": 0.0, "arousal": 0.3},
        }
```

- [ ] **Step 4: 跑测试通过**

```bash
cd /Users/kang/Desktop/VibeChat/backend
pytest tests/test_host_service.py -v
```
Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/host_service.py backend/tests/test_host_service.py
git commit -m "feat(host): icebreak/summary workflow with fallback + tests"
```

---

## Task 21: 离场端点（返回 summary + mood_end + start_vector）

**Files:**
- Modify: `backend/app/repositories/emotion_repo.py`（加 `get_latest_by_session`）
- Modify: `backend/app/routers/rooms.py`（加 `POST /rooms/{slug}/leave`）

- [ ] **Step 1: emotion_repo 加函数**

```python
from sqlalchemy import select
# 顶部已有 select 时无需重复导入
def get_latest_by_session(db: DBSession, session_id: str) -> EmotionAnalysis | None:
    return db.scalar(
        select(EmotionAnalysis).where(EmotionAnalysis.session_id == session_id)
        .order_by(EmotionAnalysis.created_at.desc()).limit(1)
    )
```

- [ ] **Step 2: rooms.py 加离场端点**

`backend/app/routers/rooms.py` 顶部补 import：
```python
from pydantic import BaseModel
from ..services import host_service
from ..repositories import emotion_repo
```
追加：
```python
class LeaveRequest(BaseModel):
    session_id: str
    dialogue: str = ""


@router.post("/rooms/{slug}/leave")
async def leave_room(slug: str, payload: LeaveRequest, db: DBSession = Depends(get_db)):
    room = room_repo.get_room_by_slug(db, slug)
    if not room:
        raise HTTPException(status_code=404, detail="房间不存在")
    latest = emotion_repo.get_latest_by_session(db, payload.session_id)
    member_emotion = latest.primary if latest else ""
    start_vector = latest.vector if latest else [0.0, 0.0, 0.0, 0.0]
    result = await host_service.summarize(member_emotion, room.name, payload.dialogue)
    return {
        "code": 0, "message": "ok",
        "data": {
            "summary": result["summary"],
            "takeaway": result["takeaway"],
            "mood_end": result["mood_end"],
            "start_vector": start_vector,
        },
    }
```

- [ ] **Step 3: 验证 + Commit**

```bash
cd /Users/kang/Desktop/VibeChat/backend
uvicorn app.main:app --reload --port 8000
# 先 analyze（建立 emotion_analysis），再 leave：
curl -s -b /tmp/ck.txt -X POST http://127.0.0.1:8000/api/rooms/emo/leave \
  -H "Content-Type: application/json" -d '{"session_id":"<你的sid>","dialogue":"睡不着，聊了几句"}'
```
Expected: 返回 `summary` / `takeaway` / `mood_end` / `start_vector`（未配 key 时走降级模板）。

```bash
git add backend/app/repositories/emotion_repo.py backend/app/routers/rooms.py
git commit -m "feat(api): room leave endpoint with summary + mood_end + start_vector"
```

---

## Task 22: 兜底 bot（独处时招呼）+ 求助链路确认

**Files:**
- Modify: `backend/app/ws/rooms_ws.py`（join 后若独处，bot 发欢迎语）
- Modify: `backend/app/ws/rooms_ws.py`（import host_service.BOT_WELCOME）

- [ ] **Step 1: rooms_ws.py 顶部补 import**

```python
from ..services.host_service import BOT_WELCOME
```

- [ ] **Step 2: 在 join + `_broadcast_state` 之后插入兜底 bot**

定位 `await _broadcast_state(slug)`（join 分支内），其后追加：
```python
        # 兜底 bot：房间只有自己时，bot 先打个招呼（房间永不冷场）
        if len(manager.vectors(slug)) <= 1:
            await websocket.send_json({
                "type": "message", "sender": "匿名居民", "nickname": "匿名居民",
                "role": "bot",
                "content": BOT_WELCOME.get(room.slug, "这儿不只有你，慢慢说。"),
                "ts": _ts(),
            })
```

- [ ] **Step 3: 验证兜底 bot + 求助链路**

```bash
# 重新跑 ws_probe（M4），独处时应额外收到一条 role=bot 的 message
python scripts/ws_probe.py

# 求助链路：输入极端文本 → help_needed=true
curl -s -b /tmp/ck.txt -X POST http://127.0.0.1:8000/api/emotion/analyze \
  -H "Content-Type: application/json" -d '{"text":"我真的不想活了"}' | grep help_needed
```
Expected: ws_probe 收到 bot 欢迎语；analyze 返回 `"help_needed":true`。

- [ ] **Step 4: 全量回归 + Commit**

```bash
pytest tests/ -v   # 全绿
git add backend/app/ws/rooms_ws.py
git commit -m "feat(ws): fallback bot greeting when room is solo"
```

---

## M5 验收

- [ ] `icebreak` / `summarize` 有降级，单测全绿
- [ ] 离场端点返回 `summary` + `mood_end` + `start_vector`（M6 旅程数据就绪）
- [ ] 独处时兜底 bot 发欢迎语（房间不冷场）
- [ ] 极端文本 → `help_needed=true`（求助链路通）

**满足后进入 [M6 差异化情绪场](./M6-差异化情绪场.md)。**
