EMOTION_SYSTEM = (
    "你是情绪分析专家。读取用户的心情文字，输出严格符合 JSON schema 的结果，"
    "不要输出 JSON 以外的内容，数值字段严格落在指定区间。"
)

EMOTION_SCHEMA = {"type": "object"}


def emotion_user(text: str) -> str:
    return (
        f'文本："{text}"\n\n'
        "要求输出 JSON："
        '{"primary":str主情绪, "secondary":[str次要], '
        '"valence":float∈[-1,1]正负向, "arousal":float∈[0,1]激动度, '
        '"intensity":float∈[0,1]强度, "social":float∈[0,1]倾诉倾向, '
        '"keywords":[str], "reading":str≤30字解读, '
        '"risk_flag":bool是否有自伤/极端倾向}'
    )
