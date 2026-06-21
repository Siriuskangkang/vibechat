from fastapi import Request
from fastapi.responses import JSONResponse


class VibeChatError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status


def register_exception_handlers(app):
    @app.exception_handler(VibeChatError)
    async def _handle(req: Request, exc: VibeChatError):
        return JSONResponse(
            status_code=exc.status,
            content={"code": exc.code, "message": exc.message, "data": None},
        )
