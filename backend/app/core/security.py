from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import jwt

from app.core.config import settings

# Настройка контекста для хэширования паролей с помощью алгоритма bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 1. Функция для создания хэша пароля
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# 2. Функция для проверки совпадения сырого пароля с хэшем из базы данных
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# 3. Функция для генерации JWT токена доступа
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Добавляем время истечения токена в полезную нагрузку (payload)
    to_encode.update({"exp": expire})
    
    # Кодируем токен с помощью нашего секретного ключа
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt
