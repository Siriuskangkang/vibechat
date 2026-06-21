from ..llm.factory import get_llm
from ..core.config import settings

ICEBREAK_SYSTEM = (
    "你是匿名情绪房间的温和主持。用第二人称、克制、不评判、像朋友一样的语气，"
    "根据房间氛围和新成员的情绪，自然地说一句开场白或抛一个低门槛的话题。"
    "话要短、具体、贴合情绪，不要说教，不要用「我们」开头。只输出符合 schema 的 JSON。"
)
SUMMARY_SYSTEM = "你是匿名情绪房间的温和主持。基于用户在本房的对话与情绪，给一个温柔的情绪小总结，只输出符合 schema 的 JSON。"

ICEBREAK_FALLBACK = {
    "late-night-anxiety": "这间房的人都被某件事压着，说说你正在面对什么？",
    "emo": "不用急着说话，待着也行。",
    "joyful-share": "有开心事就抖出来吧，这间房专收好消息。",
    "vent-anger": "被什么气到了？先说为敬，我们听着。",
    "calm-solo": "今天挺安静的，想随便聊聊还是就待会儿？",
    "lost-advice": "卡住了？说说你正纠结的事，大家帮你捋一捋。",
    "lonely-miss": "这间房装着想念。那个人或那段时光，愿意说说吗？",
    "exhausted-blank": "累了就歇会儿，这间房允许什么都不想。",
    "touched-warm": "被什么打动了？这份暖，值得说出来。",
    "nervous-hope": "在等什么结果吗？这份悬着的心，说说看。",
    "wronged-sad": "受委屈了？这儿不评判，只听你说。",
    "relief-letgo": "松了口气？这份轻盈，是怎么来的？",
}
BOT_WELCOME = {
    "late-night-anxiety": "这儿不只有你，深夜醒着的人都在。",
    "emo": "没关系，这儿允许低落。",
    "joyful-share": "来，把好消息放这儿。",
    "vent-anger": "气就气，我们不评判。",
    "calm-solo": "安静地待着，也挺好。",
    "lost-advice": "迷茫的时候，说出来会清楚一点。",
    "lonely-miss": "想念不需要理由，这儿可以放着它。",
    "exhausted-blank": "放空也是一种休息，慢慢来。",
    "touched-warm": "温暖的瞬间，这儿有人愿意接住。",
    "nervous-hope": "期待和紧张挨得很近，慢慢说。",
    "wronged-sad": "难过就难过，不用逞强。",
    "relief-letgo": "放下的感觉很好，这儿可以慢慢舒展。",
}


async def icebreak(slug: str, vibe: str, member_emotion: str, recent: list[str]) -> str:
    user = f"房间氛围：{vibe}；新成员情绪：{member_emotion}；最近对话：{recent}"
    prompt = (
        user
        + '\n\n参考示例（风格参考，不要照抄内容）：\n'
        + '示例1：房间氛围「紧绷、深夜」，新成员情绪「消极、焦虑」→ {"message":"这间房的人都被某件事压着，说说你正在面对什么？"}\n'
        + '示例2：房间氛围「明亮、上扬」，新成员情绪「积极、喜悦」→ {"message":"有开心事就抖出来吧，这间房专收好消息。"}\n'
        + '示例3：房间氛围「酸涩、想哭」，新成员情绪「消极、委屈」→ {"message":"受委屈了？这儿不评判，你想从哪说起都行。"}\n'
        + '\n要求输出：{"message": str≤40字}'
    )
    try:
        llm = get_llm()
        resp = await llm.chat(ICEBREAK_SYSTEM, prompt, json_schema={"type": "object"}, max_tokens=settings.llm_max_tokens)
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
        resp = await llm.chat(SUMMARY_SYSTEM, prompt, json_schema={"type": "object"}, max_tokens=settings.llm_max_tokens)
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
