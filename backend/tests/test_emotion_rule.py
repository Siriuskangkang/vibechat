from app.services.emotion_service import rule_analyze


def test_rule_analyze_anxiety():
    r = rule_analyze("明天汇报睡不着，很焦虑")
    assert r["primary"] == "焦虑"
    assert r["valence"] < 0
    assert r["provider"] == "rule-fallback"
    assert r["vector"] == [r["valence"], r["arousal"], r["intensity"], r["social"]]


def test_rule_analyze_joy():
    r = rule_analyze("今天特别开心，想分享")
    assert r["valence"] > 0


def test_rule_analyze_default():
    r = rule_analyze("asdjkl匿名随意的文字")
    assert "vector" in r and len(r["vector"]) == 4
    assert r["provider"] == "rule-fallback"
