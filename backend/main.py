from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api import router
from database import Base, engine
from routers import auth
import models

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/admin/db-info")
def get_db_info():
    try:
        from database import engine
        db_url = str(engine.url)
        return {
            "status": "success",
            "database_type": "PostgreSQL" if "postgresql" in db_url else "SQLite",
            "connection_string": db_url.split("@")[0] + "@***" if "@" in db_url else db_url
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/admin/db-test")
def test_db_connection():
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            return {
                "status": "success",
                "database_type": "PostgreSQL",
                "version": version
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/admin/schema-info")
def get_schema_info():
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            customers_result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'customers' 
                ORDER BY ordinal_position
            """))
            customers_schema = [{"column": row[0], "type": row[1], "nullable": row[2]} for row in customers_result]
            
            cards_result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'cards' 
                ORDER BY ordinal_position
            """))
            cards_schema = [{"column": row[0], "type": row[1], "nullable": row[2]} for row in cards_result]
            
            return {
                "status": "success",
                "customers_schema": customers_schema,
                "cards_schema": cards_schema
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/admin/generate-data")
def generate_data():
    try:
        from generate_data import main as generate_main
        generate_main()
        return {"status": "success", "message": "Data generated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/reset-db")
def reset_database():
    try:
        from database import Base, engine
        print("Resetting database schema...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database schema reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/delete-db")
def delete_db():
    try:
        from delete_db import delete_database
        delete_database()
        return {"status": "success", "message": "Database deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 