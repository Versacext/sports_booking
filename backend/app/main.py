from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, fields, bookings

# Автоматическое создание таблиц в базе данных при старте приложения
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Безупречная система бронирования спортивных площадок",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры с общим префиксом v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(fields.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root_check():
    return {
        "status": "online",
        "message": "Система бронирования спортивных площадок функционирует в штатном режиме."
    }
