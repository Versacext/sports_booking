from pydantic import BaseModel, Field as PydanticField
from decimal import Decimal

class FieldBase(BaseModel):
    name: str = PydanticField(..., min_length=3, max_length=100)
    type: str = PydanticField(..., description="Тип площадки: Футбол или Теннис")
    price_per_hour: Decimal = PydanticField(..., gt=0, description="Цена за час должна быть больше нуля")

# Схема для создания площадки (админская панель)
class FieldCreate(FieldBase):
    pass

# Схема для ответа API
class FieldOut(FieldBase):
    id: str

    class Config:
        from_attributes = True
