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
            # Collect pre-message frames: history (0+), member_join, presence,
            # room_mood, bot welcome (solo). The AI host icebreak runs as a
            # background task and may take ~60s when the LLM is slow/unreachable,
            # so we do not block on it here.
            deadline = time.time() + 8
            while time.time() < deadline and len(types) < 10:
                try:
                    types.append(ws.receive_json(timeout=5)["type"])
                except TypeError:
                    # TestClient receive_json has no timeout arg on some versions
                    try:
                        types.append(ws.receive_json()["type"])
                    except Exception:
                        break
                except Exception:
                    break
                if "member_join" in types and "room_mood" in types:
                    break
            print("init types:", types)
            assert "member_join" in types, f"expected member_join in {types}"
            assert "room_mood" in types, f"expected room_mood in {types}"

            ws.send_json({"type": "message", "content": "你好"})
            # Sender is excluded from broadcast, so we should NOT receive our
            # own message echoed back. Any subsequent frame is the async host
            # icebreak (not our echo); confirm content != "你好".
            echo_seen = False
            check_deadline = time.time() + 6
            while time.time() < check_deadline:
                try:
                    m = ws.receive_json(timeout=5)
                except TypeError:
                    try:
                        m = ws.receive_json()
                    except Exception:
                        break
                except Exception:
                    break
                if m.get("type") == "message" and m.get("content") == "你好":
                    echo_seen = True
                    break
            assert not echo_seen, "sender received its own message (no exclude)"
            print("no self-echo ✓")


if __name__ == "__main__":
    main()
