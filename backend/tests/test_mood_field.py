from app.services.mood_field import room_mood, resonance


def test_room_mood_single_is_self():
    assert room_mood([[-0.6, 0.8, 0.8, 0.6]]) == [-0.6, 0.8, 0.8, 0.6]


def test_room_mood_empty():
    assert room_mood([]) == [0.0, 0.0, 0.0, 0.0]


def test_room_mood_weighted_by_intensity():
    m = room_mood([[-0.6, 0.8, 0.8, 0.6], [0.7, 0.6, 0.6, 0.75]])
    expected_valence = (-0.6 * 0.8 + 0.7 * 0.6) / 1.4
    assert abs(m[0] - expected_valence) < 1e-6
    assert len(m) == 4


def test_resonance_identical_is_one():
    assert resonance([[0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]) == 1.0


def test_resonance_diverged_is_low():
    r = resonance([[-0.8, 0.9, 0.9, 0.9], [0.8, 0.1, 0.1, 0.1]])
    assert r < 0.5


def test_resonance_empty():
    assert resonance([]) == 0.0
