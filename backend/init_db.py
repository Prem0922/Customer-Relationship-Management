from database import engine
from models import Base

def init_db():
    print("Dropping all existing tables to fix schema...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables with correct schema...")
    Base.metadata.create_all(bind=engine)
    print("Database tables recreated with correct schema!")

if __name__ == "__main__":
    init_db()
    print("Database initialization complete!") 