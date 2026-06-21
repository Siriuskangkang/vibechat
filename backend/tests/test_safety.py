from app.services.safety import has_risk


def test_risk_keyword_hit():
    assert has_risk("我不想活了") is True


def test_risk_flag_from_llm():
    assert has_risk("今天天气不错", risk_flag=True) is True


def test_normal_text_safe():
    assert has_risk("明天要汇报，有点紧张") is False


def test_empty_safe():
    assert has_risk("") is False
