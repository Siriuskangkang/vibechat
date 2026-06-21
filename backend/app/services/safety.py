RISK_KEYWORDS = ["自杀", "不想活", "轻生", "自残", "结束生命", "活不下去", "了结自己"]


def has_risk(text: str, risk_flag: bool = False) -> bool:
    if risk_flag:
        return True
    if not text:
        return False
    return any(k in text for k in RISK_KEYWORDS)
