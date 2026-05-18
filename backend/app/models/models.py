import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

# Генератор уникальных строковых ID (UUID)
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="sportsman")  # "sportsman" или "admin"

    # Связи
    bookings = relationship("Booking", back_populates="user")


class Field(Base):
    __tablename__ = "fields"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)        # Например: "Поле для мини-футбола №1"
    type = Column(String, nullable=False)        # "Футбол" или "Теннис"
    price_per_hour = Column(Numeric(10, 2), nullable=False)

    # Связи
    bookings = relationship("Booking", back_populates="field")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    field_id = Column(String, ForeignKey("fields.id"), nullable=False)
    
    start_time = Column(DateTime, nullable=False)  # Начало бронирования
    end_time = Column(DateTime, nullable=False)    # Конец бронирования
    status = Column(String, default="confirmed")   # "confirmed" или "cancelled"

    # Обратные связи
    user = relationship("User", back_populates="bookings")
    field = relationship("Field", back_populates="bookings")
