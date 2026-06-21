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
