import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app


def main():
    with TestClient(app) as c:
        c.post("/api/session")
        with c.websocket_connect("/api/ws/room/emo") as ws:
            ws.send_json({"type": "join", "session_id": "test-s", "vector": [-0.5, 0.3, 0.6, 0.55]})
            types = []
            # Collect pre-message frames: member_join, presence, room_mood, bot welcome
            # plus the AI host icebreak (fired via a background task, may take up to
            # ~60s when the LLM endpoint is slow/unreachable before falling back).
            deadline = time.time() + 90
            while time.time() < deadline and len(types) < 5:
                try:
                    types.append(ws.receive_json(timeout=70)["type"])
                except TypeError:
                    # TestClient receive_json has no timeout arg on some versions
                    types.append(ws.receive_json()["type"])
                if "host" in types:
                    break
            ws.send_json({"type": "message", "content": "你好"})
            m = ws.receive_json()
            types.append(m["type"])
            print("types:", types)
            print("msg content:", m.get("content"), "role:", m.get("role"))
            assert "message" in types
            assert m["content"] == "你好"
            assert "host" in types, f"expected host icebreak in {types}"


if __name__ == "__main__":
    main()
