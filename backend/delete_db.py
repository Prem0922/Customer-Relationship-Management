import os
import sys
from models import Base
from database import engine

def delete_database():
    db_path = "database.db"
    
    try:
        print("\nDropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✅ Database file '{db_path}' successfully deleted!")
        else:
            print(f"⚠️ Database file '{db_path}' does not exist.")
            
        print("\nYou can now run generate_data.py to create a fresh database.")
        
    except Exception as e:
        print(f"\n❌ Error deleting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.") 