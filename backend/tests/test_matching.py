from app.services.matching import cosine_sim, affinity, best_room, match_rooms


def test_cosine_sim_positive():
    assert cosine_sim([1, 1, 1, 1], [1, 1, 1, 1]) == 1.0


def test_cosine_sim_zero_vector():
    assert cosine_sim([0, 0, 0, 0], [1, 1, 1, 1]) == 0.0


def test_affinity_maps_to_percentage():
    a = affinity([1, 1, 1, 1], [1, 1, 1, 1])
    assert a == 100
    assert 0 <= affinity([-0.6, 0.8, 0.8, 0.6], [0.7, 0.6, 0.6, 0.75]) <= 100


def test_best_room_picks_highest():
    rooms = [
        {"slug": "a", "anchor_vector": [-0.6, 0.8, 0.8, 0.6]},
        {"slug": "b", "anchor_vector": [0.7, 0.6, 0.6, 0.75]},
    ]
    user = [-0.5, 0.7, 0.7, 0.6]
    assert best_room(user, rooms)["slug"] == "a"


def test_match_rooms_sorted_desc():
    rooms = [
        {"slug": "a", "name": "A", "color": "#111", "anchor_vector": [-0.6, 0.8, 0.8, 0.6]},
        {"slug": "b", "name": "B", "color": "#222", "anchor_vector": [0.7, 0.6, 0.6, 0.75]},
    ]
    user = [-0.5, 0.7, 0.7, 0.6]
    scored = match_rooms(user, rooms)
    assert scored[0]["slug"] == "a"
    assert scored[0]["affinity"] >= scored[1]["affinity"]
    assert "affinity" in scored[0]
