from pydantic import BaseModel, EmailStr, Field as PydanticField
from typing import Optional

# Базовые поля пользователя
class UserBase(BaseModel):
    email: EmailStr

# Схема для регистрации (входные данные)
class UserCreate(UserBase):
    password: str = PydanticField(..., min_length=6, description="Пароль должен быть не менее 6 символов")

# Схема для авторизации (входные данные)
class UserLogin(UserBase):
    password: str

# Схема для ответа API (данные, которые отдаем фронтенду, без пароля!)
class UserOut(UserBase):
    id: str
    role: str

    class Config:
        from_attributes = True

# Схема для токена доступа JWT
class Token(BaseModel):
    access_token: str
    token_type: str

# Схема для данных внутри токена
class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
