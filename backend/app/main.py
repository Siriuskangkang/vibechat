from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .core.exceptions import register_exception_handlers
from .routers import health, session, emotion, rooms
from .ws import rooms_ws
from .core.config import settings
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="VibeChat", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)
app.include_router(health.router, prefix="/api")
app.include_router(session.router, prefix="/api")
app.include_router(emotion.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(rooms_ws.router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
