from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.models import Booking, User
from app.schemas.bookings import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# 1. Спортсмен: Создать бронирование (с проверкой наложений времени)
@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Проверка наложения времени: ищем бронирования на это же поле, пересекающиеся по времени
    overlapping_booking = db.query(Booking).filter(
        Booking.field_id == booking_data.field_id,
        Booking.status == "confirmed",
        Booking.start_time < booking_data.end_time,
        Booking.end_time > booking_data.start_time
    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=400, 
            detail="Выбранное временное окно уже занято. Пожалуйста, выберите другое время."
        )

    new_booking = Booking(
        user_id=current_user.id,
        field_id=booking_data.field_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

# 2. Спортсмен: Посмотреть свои личные бронирования
@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()

# 3. Админ: Посмотреть ВЕ СИСТЕМНЫЕ бронирования (Панель администратора)
@router.get("/admin/all", response_model=List[BookingOut])
def get_all_bookings_for_admin(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return db.query(Booking).all()

# 4. Админ/Пользователь: Отменить бронь
@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    
    # Отменить может либо админ, либо сам владелец брони
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав для отмены этого бронирования")
        
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
