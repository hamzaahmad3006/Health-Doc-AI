from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Default to SQLite if DATABASE_URL is not set
# On Vercel (or other serverless read-only functions), we must write SQLite to /tmp
is_vercel = os.environ.get("VERCEL") == "1"
db_path = os.path.join("/tmp" if is_vercel else BASE_DIR, 'backend_db.sqlite')
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# Fix for Supabase/PostgreSQL connection string prefixes if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, 
    # Use check_same_thread=False only for SQLite
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
