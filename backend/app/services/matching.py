import math

WEIGHTS = [1.0, 1.0, 0.6, 0.5]


def cosine_sim(u: list[float], r: list[float], weights: list[float] = WEIGHTS) -> float:
    wu = [u[i] * weights[i] for i in range(len(u))]
    wr = [r[i] * weights[i] for i in range(len(u))]
    dot = sum(wu[i] * wr[i] for i in range(len(u)))
    nu = math.sqrt(sum(x * x for x in wu))
    nw = math.sqrt(sum(x * x for x in wr))
    if nu == 0 or nw == 0:
        return 0.0
    return dot / (nu * nw)


def affinity(u: list[float], r: list[float]) -> int:
    return round(max(0.0, cosine_sim(u, r)) * 100)


def best_room(user_vec: list[float], rooms: list[dict]) -> dict:
    return max(rooms, key=lambda rm: cosine_sim(user_vec, rm["anchor_vector"]))


def match_rooms(user_vec: list[float], rooms: list[dict]) -> list[dict]:
    scored = [{**rm, "affinity": affinity(user_vec, rm["anchor_vector"])} for rm in rooms]
    return sorted(scored, key=lambda x: x["affinity"], reverse=True)
