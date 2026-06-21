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


async def test_broadcast_excludes_target():
    """typing / reaction 事件必须 exclude 发送者，避免自己看到自己的输入提示与光点。"""
    mgr = ConnectionManager()
    a, b = FakeWS(), FakeWS()
    await mgr.join("emo", a, {"vector": [0, 0, 0, 0]})
    await mgr.join("emo", b, {"vector": [0, 0, 0, 0]})
    await mgr.broadcast("emo", {"type": "typing"}, exclude=a)
    assert {"type": "typing"} not in a.sent
    assert {"type": "typing"} in b.sent


def test_member_id_is_stable_short_hash():
    """presence 成员 id 用 session_id 的 md5 前 6 位：稳定、短、不暴露原 session_id。"""
    from app.ws.rooms_ws import _member_id
    assert _member_id("sess-abc") == _member_id("sess-abc")
    assert len(_member_id("sess-abc")) == 6
    assert _member_id("sess-abc") != "sess-abc"
    assert _member_id("sess-abc") != _member_id("sess-abd")
    assert _member_id("") == ""
