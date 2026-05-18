from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sports Court Booking API"
    
    # SQLite для локальной разработки (база создастся автоматически)
    DATABASE_URL: str = "sqlite:///./sports_booking.db"
    
    # Безопасность и JWT
    JWT_SECRET: str = "SUPER_SECRET_CORE_KEY_9988_KEEP_IT_SAFE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # Токен активен 24 часа

    class Config:
        env_file = ".env"

settings = Settings()
