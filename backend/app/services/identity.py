import hashlib

# 每个房间：情绪化的形容词 × 意象名词，组合出有画面感的匿名昵称。
# 词库足够大（每房 6×6=36 组合），12 房间共 432 种，重复率极低。
ROOM_NICKNAMES = {
    "late-night-anxiety": (
        ["失眠的", "辗转的", "清醒的", "停不下的", "绷弦的", "数羊的"],
        ["云", "钟", "信号", "月相", "回声", "夜灯"],
    ),
    "emo": (
        ["微暗的", "漂浮的", "失焦的", "沉水的", "发霉的", "退潮的"],
        ["雾", "影子", "潮", "灰", "气泡", "余烬"],
    ),
    "joyful-share": (
        ["闪光的", "轻快的", "暖的", "起泡的", "上扬的", "镀金的"],
        ["气泡", "光斑", "回声", "糖纸", "烟花", "羽毛"],
    ),
    "vent-anger": (
        ["灼热的", "绷紧的", "直接的", "冒烟的", "沸腾的", "尖锐的"],
        ["火星", "鼓点", "电流", "响雷", "棘刺", "焰"],
    ),
    "calm-solo": (
        ["安静的", "缓慢的", "透明的", "微温的", "沉淀的", "留白的"],
        ["水面", "苔藓", "月光", "茶", "卵石", "蒲公英"],
    ),
    "lost-advice": (
        ["盘旋的", "迟疑的", "半开的", "兜圈的", "岔路的", "未提交的"],
        ["门", "罗盘", "问号", "雾灯", "线团", "钟摆"],
    ),
    "lonely-miss": (
        ["遥远的", "沉默的", "回望的", "空号的", "拨不通的", "折叠的"],
        ["灯塔", "信", "影子", "站台", "旧歌", "空椅"],
    ),
    "exhausted-blank": (
        ["疲惫的", "放空的", "失语的", "断电的", "缓存的", "待机的"],
        ["石头", "雾", "休止符", "灰烬", "旧沙发", "空杯"],
    ),
    "touched-warm": (
        ["柔软的", "微光的", "温热的", "融化的", "抱住的", "发芽的"],
        ["琥珀", "烛火", "回声", "毛毯", "暖手宝", "糖"],
    ),
    "nervous-hope": (
        ["悬心的", "期待的", "绷紧的", "屏息的", "等风的", "倒数的"],
        ["弦", "潮汐", "钟摆", "萤火", "信号", "日历"],
    ),
    "wronged-sad": (
        ["哽咽的", "酸涩的", "低头的", "泛红的", "咬唇的", "缩起来的"],
        ["雨", "潮", "茧", "盐", "雾", "旧伤"],
    ),
    "relief-letgo": (
        ["轻盈的", "舒展的", "松开的", "长出一口气的", "落地的", "解冻的"],
        ["羽", "云", "门", "蒲公英", "风", "涟漪"],
    ),
}

# 头像几何形状：配合连续色相，让每个用户的视觉标识都不同。
SHAPES = ["circle", "rounded", "square", "triangle", "hexagon", "diamond", "pentagon"]


def gen_nickname(slug: str, session_id: str, used: set[str]) -> str:
    adjs, nouns = ROOM_NICKNAMES.get(slug, (["安静的"], ["旅人"]))
    for a in adjs:
        for n in nouns:
            name = f"{a}{n}"
            if name not in used:
                return name
    # 笛卡尔积用尽：加短哈希后缀保证唯一
    h = hashlib.md5(session_id.encode()).hexdigest()[:3]
    return f"{adjs[0]}{nouns[0]}{h}"


def emotion_color(valence: float, arousal: float) -> str:
    """把 valence/arousal 连续映射到色相，告别单调的金/蓝两色。

    积极情绪→暖色，中性→青绿，消极情绪→冷色；arousal 越高越饱和、张力越强。
    """
    v = max(-1.0, min(1.0, valence))
    a = max(0.0, min(1.0, arousal))
    if v >= 0.15:
        hue = 42 - a * 22          # 积极：暖橙(激动) ~ 暖金(平静)
    elif v <= -0.15:
        hue = 215 + a * 95         # 消极：蓝(低能) ~ 品红紫(激动)
    else:
        hue = 165 - a * 20         # 中性：青绿
    sat = round(58 + a * 22)
    light = round(48 + (1 - a) * 12)
    return f"hsl({round(hue)}, {sat}%, {light}%)"


def avatar_shape(session_id: str, slug: str) -> str:
    h = int(hashlib.md5((session_id + slug).encode()).hexdigest(), 16)
    return SHAPES[h % len(SHAPES)]


def make_avatar(session_id: str, slug: str, valence: float, arousal: float) -> dict:
    return {"color": emotion_color(valence, arousal), "shape": avatar_shape(session_id, slug)}
