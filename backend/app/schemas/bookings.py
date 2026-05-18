from pydantic import BaseModel, model_validator
from datetime import datetime
from app.schemas.fields import FieldOut

class BookingBase(BaseModel):
    field_id: str
    start_time: datetime
    end_time: datetime

# Схема для создания бронирования (входные данные от спортсмена)
class BookingCreate(BookingBase):
    
    # Безупречная валидация времени на уровне Pydantic
    @model_validator(mode='after')
    def check_dates(self):
        if self.start_time >= self.end_time:
            raise ValueError("Время начала бронирования должно быть раньше времени окончания.")
        if self.start_time < datetime.now():
            raise ValueError("Нельзя забронировать площадку на прошедшее время.")
        return self

# Схема для ответа API
class BookingOut(BaseModel):
    id: str
    user_id: str
    field_id: str
    start_time: datetime
    end_time: datetime
    status: str
    field: FieldOut  # Вложенная информация о площадке

    class Config:
        from_attributes = True
