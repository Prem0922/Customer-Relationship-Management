from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    connect_args = {}
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_FILE = "transit_card.db"
    DATABASE_PATH = os.path.join(BASE_DIR, DATABASE_FILE)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=True,
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 