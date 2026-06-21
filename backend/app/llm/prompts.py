EMOTION_SYSTEM = (
    "你是情绪分析专家。读取用户的心情文字，输出严格符合 JSON schema 的结果，"
    "不要输出 JSON 以外的内容，数值字段严格落在指定区间。"
)

EMOTION_SCHEMA = {"type": "object"}


def emotion_user(text: str) -> str:
    return (
        f'文本："{text}"\n\n'
        "要求输出 JSON："
        '{"primary":str中文主情绪词(必须是中文,如:焦虑/喜悦/愤怒/低落/平静/迷茫/孤独/疲惫/紧张/失落/委屈/释然), "secondary":[str中文次要情绪], '
        '"valence":float∈[-1,1]正负向, "arousal":float∈[0,1]激动度, '
        '"intensity":float∈[0,1]强度, "social":float∈[0,1]倾诉倾向, '
        '"keywords":[str], "reading":str≤30字解读, '
        '"risk_flag":bool是否有自伤/极端倾向}'
    )
