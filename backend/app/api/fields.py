from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.models import Field
from app.schemas.fields import FieldCreate, FieldOut

router = APIRouter(prefix="/fields", tags=["Sports Fields"])

# Получить список всех площадок (Доступно всем спортсменам)
@router.get("/", response_model=List[FieldOut])
def get_fields(db: Session = Depends(get_db)):
    return db.query(Field).all()

# Создать новую площадку (Доступно ТОЛЬКО админу)
@router.post("/", response_model=FieldOut, status_code=status.HTTP_201_CREATED)
def create_field(field_data: FieldCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    new_field = Field(name=field_data.name, type=field_data.type, price_per_hour=field_data.price_per_hour)
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field
