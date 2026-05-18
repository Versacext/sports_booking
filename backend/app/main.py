from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sports Court Booking API",
    description="Безупречная система бронирования спортивных площадок",
    version="1.0.0"
)

# Настройка CORS для будущего фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root_check():
    return {
        "status": "online",
        "message": "Система бронирования спортивных площадок функционирует в штатном режиме."
    }
