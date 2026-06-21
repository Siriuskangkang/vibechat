import hashlib

ROOM_NICKNAMES = {
    "late-night-anxiety": (["失眠的", "停不下的", "清醒的", "辗转的"], ["云", "钟", "灯", "信号"]),
    "emo": (["微暗的", "漂浮的", "失焦的"], ["潮", "雾", "影子"]),
    "joyful-share": (["闪光的", "轻快的", "暖的"], ["气泡", "光斑", "回声"]),
    "vent-anger": (["灼热的", "绷紧的", "直接的"], ["火星", "鼓点", "电流"]),
    "calm-solo": (["安静的", "缓慢的", "透明的"], ["水面", "苔藓", "月光"]),
    "lost-advice": (["盘旋的", "迟疑的", "半开的"], ["门", "罗盘", "问号"]),
}
SHAPES = ["circle", "triangle", "hexagon", "square"]


def gen_nickname(slug: str, session_id: str, used: set[str]) -> str:
    adjs, nouns = ROOM_NICKNAMES.get(slug, (["安静的"], ["旅人"]))
    for a in adjs:
        for n in nouns:
            name = f"{a}{n}"
            if name not in used:
                return name
    h = hashlib.md5(session_id.encode()).hexdigest()[:3]
    return f"{adjs[0]}{nouns[0]}{h}"


def emotion_color(valence: float, arousal: float) -> str:
    hue = 40 if valence >= 0 else 240
    light = round(40 + arousal * 40)
    return f"hsl({hue}, 70%, {light}%)"


def avatar_shape(session_id: str, slug: str) -> str:
    h = int(hashlib.md5((session_id + slug).encode()).hexdigest(), 16)
    return SHAPES[h % len(SHAPES)]


def make_avatar(session_id: str, slug: str, valence: float, arousal: float) -> dict:
    return {"color": emotion_color(valence, arousal), "shape": avatar_shape(session_id, slug)}
