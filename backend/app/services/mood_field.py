import math


def room_mood(vectors: list[list[float]]) -> list[float]:
    if not vectors:
        return [0.0, 0.0, 0.0, 0.0]
    if len(vectors) == 1:
        return list(vectors[0])
    total_w = sum(v[2] for v in vectors) or 1.0
    return [sum(v[d] * v[2] for v in vectors) / total_w for d in range(4)]


def resonance(vectors: list[list[float]]) -> float:
    if not vectors:
        return 0.0
    n = len(vectors)
    c = room_mood(vectors)
    mean_dist = sum(math.dist(v, c) for v in vectors) / n
    return max(0.0, 1.0 - min(mean_dist / 2.0, 1.0))
