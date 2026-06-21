from app.ws.connection_manager import ConnectionManager


class FakeWS:
    def __init__(self):
        self.sent = []

    async def send_json(self, m):
        self.sent.append(m)


async def test_join_and_vectors():
    mgr = ConnectionManager()
    a, b = FakeWS(), FakeWS()
    await mgr.join("emo", a, {"vector": [-0.5, 0.3, 0.6, 0.55]})
    await mgr.join("emo", b, {"vector": [-0.4, 0.3, 0.5, 0.5]})
    assert len(mgr.vectors("emo")) == 2


async def test_broadcast_reaches_all():
    mgr = ConnectionManager()
    a, b = FakeWS(), FakeWS()
    await mgr.join("emo", a, {"vector": [0, 0, 0, 0]})
    await mgr.join("emo", b, {"vector": [0, 0, 0, 0]})
    await mgr.broadcast("emo", {"type": "x"})
    assert {"type": "x"} in a.sent
    assert {"type": "x"} in b.sent


async def test_leave_removes_vector():
    mgr = ConnectionManager()
    a = FakeWS()
    await mgr.join("emo", a, {"vector": [0, 0, 0, 0]})
    mgr.leave("emo", a)
    assert mgr.vectors("emo") == []
