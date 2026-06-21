import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app


def main():
    with TestClient(app) as c:
        c.post("/api/session")
        with c.websocket_connect("/api/ws/room/emo") as ws:
            ws.send_json({"type": "join", "session_id": "test-s", "vector": [-0.5, 0.3, 0.6, 0.55]})
            types = []
            for _ in range(3):  # member_join, presence, room_mood
                types.append(ws.receive_json()["type"])
            ws.send_json({"type": "message", "content": "你好"})
            m = ws.receive_json()
            types.append(m["type"])
            print("types:", types)
            print("msg content:", m.get("content"), "role:", m.get("role"))
            assert "message" in types
            assert m["content"] == "你好"


if __name__ == "__main__":
    main()
