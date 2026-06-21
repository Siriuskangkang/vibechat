from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, dict[WebSocket, dict]] = {}

    async def join(self, slug: str, ws: WebSocket, info: dict):
        self.rooms.setdefault(slug, {})[ws] = info

    def leave(self, slug: str, ws: WebSocket):
        self.rooms.get(slug, {}).pop(ws, None)

    def members(self, slug: str) -> dict[WebSocket, dict]:
        return self.rooms.get(slug, {})

    def vectors(self, slug: str) -> list[list[float]]:
        return [m["vector"] for m in self.members(slug).values()]

    async def broadcast(self, slug: str, msg: dict, exclude: WebSocket | None = None):
        for ws in list(self.members(slug)):
            if ws is exclude:
                continue
            try:
                await ws.send_json(msg)
            except Exception:
                self.leave(slug, ws)


manager = ConnectionManager()
