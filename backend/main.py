import os
import sys
from dotenv import load_dotenv

# Add the project root to the path so 'from backend...' works locally
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(BASE_DIR))

load_dotenv(os.path.join(BASE_DIR, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from backend.database import SessionLocal, engine
from backend.models import Base, User
from backend.routes import document_routes, auth_routes

# Ensure directories exist (wrapped for Vercel read-only filesystem)
try:
    os.makedirs(os.path.join(BASE_DIR, "static/logos"), exist_ok=True)
except OSError:
    print("Warning: Could not create static/logos directory. Running in read-only environment.")

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing API")

static_dir = os.path.join(BASE_DIR, "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Create a default user if not exists
        if not db.query(User).filter(User.id == 1).first():
            user = User(
                id=1, 
                email="admin@example.com", 
                full_name="Admin User", 
                hashed_password="mocked_password"
            )
            db.add(user)
            db.commit()
            print("Default user created.")
    finally:
        db.close()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for production; change to specific domain later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_routes.router, prefix="/api", tags=["Authentication"])
app.include_router(document_routes.router, prefix="/api/documents", tags=["Documents"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Document Processing AI API"}
