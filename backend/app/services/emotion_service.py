from ..llm.factory import get_llm
from ..llm.prompts import EMOTION_SYSTEM, EMOTION_SCHEMA, emotion_user
from ..core.exceptions import VibeChatError

RULE_MAP = [
    (["焦虑", "紧张", "担心", "睡不着", "汇报", "害怕", "压力"], -0.6, 0.8, 0.8, 0.6, "焦虑"),
    (["emo", "低落", "难过", "丧", "累", "没意思", "失落"], -0.5, 0.3, 0.6, 0.55, "低落"),
    (["开心", "高兴", "分享", "棒", "兴奋", "好消息"], 0.7, 0.6, 0.6, 0.75, "喜悦"),
    (["气", "愤怒", "烦", "恶心", "吐槽", "垃圾"], -0.6, 0.85, 0.85, 0.7, "愤怒"),
    (["平静", "安静", "发呆", "放松", "没事"], 0.3, 0.15, 0.25, 0.2, "平静"),
    (["迷茫", "纠结", "不知道", "怎么办", "选择"], -0.2, 0.4, 0.5, 0.8, "迷茫"),
]


def rule_analyze(text: str) -> dict:
    for kws, v, a, i, s, label in RULE_MAP:
        if any(k in text for k in kws):
            return _pack(label, v, a, i, s)
    return _pack("平静", 0.0, 0.3, 0.3, 0.4)


def _pack(label, v, a, i, s) -> dict:
    return {
        "primary": label, "secondary": [],
        "valence": v, "arousal": a, "intensity": i, "social": s,
        "vector": [v, a, i, s], "keywords": [],
        "reading": "（离线模式·规则推断）", "risk_flag": False,
        "provider": "rule-fallback", "model": "",
    }


async def analyze_emotion(text: str) -> dict:
    text = (text or "").strip()
    if not text:
        raise VibeChatError("bad_request", "先说说此刻的心情吧")
    if len(text) > 500:
        text = text[:500]
    try:
        llm = get_llm()
        resp = await llm.chat(EMOTION_SYSTEM, emotion_user(text), json_schema=EMOTION_SCHEMA)
        data = resp.raw_json
        if not data:
            raise ValueError("empty json")
        v = [float(data["valence"]), float(data["arousal"]), float(data["intensity"]), float(data["social"])]
        data["vector"] = v
        data["provider"] = resp.provider
        data["model"] = resp.model
        data.setdefault("risk_flag", False)
        data.setdefault("secondary", [])
        data.setdefault("keywords", [])
        return data
    except VibeChatError:
        raise
    except Exception:
        return rule_analyze(text)
