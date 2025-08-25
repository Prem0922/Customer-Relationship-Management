from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, text, UniqueConstraint, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)
    notifications = Column(String, nullable=False)
    join_date = Column(DateTime, nullable=False, default=datetime.now)
    
    cards = relationship("Card", back_populates="customer", cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="customer", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    balance = Column(Float, nullable=False)
    product = Column(String, nullable=True)
    issue_date = Column(DateTime, nullable=False, default=datetime.now)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    
    customer = relationship("Customer", back_populates="cards")
    trips = relationship("Trip", back_populates="card", cascade="all, delete-orphan")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    entry_location = Column(String, nullable=False)
    exit_location = Column(String, nullable=False)
    fare = Column(Float, nullable=False)
    route = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    transit_mode = Column(String, nullable=False)
    adjustable = Column(String, nullable=False)
    
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    card = relationship("Card", back_populates="trips")

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True)
    created_date = Column(DateTime, nullable=False, default=datetime.now)
    last_updated = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=True)
    case_status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    category = Column(String, nullable=False)
    assigned_agent = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    
    customer = relationship("Customer", back_populates="cases")
    card = relationship("Card")

class TapHistory(Base):
    __tablename__ = "tap_history"

    id = Column(String, primary_key=True)
    tap_time = Column(DateTime, nullable=False, default=datetime.now)
    location = Column(String, nullable=False)
    device_id = Column(String, nullable=False)
    transit_mode = Column(String, nullable=False)
    direction = Column(String, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    result = Column(String, nullable=False)
    
    customer = relationship("Customer")

class FareDispute(Base):
    __tablename__ = "fare_disputes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dispute_date = Column(DateTime, nullable=False, default=datetime.now)
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    trip_id = Column(String, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    dispute_type = Column(String, nullable=False)

    card = relationship("Card")
    trip = relationship("Trip")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    created_at = Column(DateTime)
    last_login = Column(DateTime, nullable=True) 