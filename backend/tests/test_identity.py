from app.services.identity import gen_nickname, emotion_color, avatar_shape, make_avatar


def test_gen_nickname_unused():
    name = gen_nickname("late-night-anxiety", "sess1", used=set())
    assert name


def test_gen_nickname_avoids_used():
    first = gen_nickname("late-night-anxiety", "s1", set())
    second = gen_nickname("late-night-anxiety", "s2", used={first})
    assert second != first


def test_gen_nickname_fallback_hash():
    name = gen_nickname("unknown-slug", "s1", set())
    assert isinstance(name, str) and len(name) > 0


def test_emotion_color_negative_vs_positive():
    neg = emotion_color(-0.7, 0.8)
    pos = emotion_color(0.7, 0.8)
    assert neg != pos
    assert neg.startswith("hsl(")


def test_avatar_shape_stable():
    assert avatar_shape("s1", "emo") == avatar_shape("s1", "emo")


def test_make_avatar_shape():
    av = make_avatar("s1", "emo", -0.5, 0.6)
    assert "color" in av and "shape" in av
