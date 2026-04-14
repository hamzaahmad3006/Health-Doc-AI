from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.models import User

async def login_user(credentials: dict, db: Session):
    email = credentials.get("email")
    password = credentials.get("password")
    
    # 1. Find user in DB
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please register.")
    
    # 2. Check password (Simple check for now)
    if user.hashed_password != password:
        raise HTTPException(status_code=401, detail="Incorrect password.")
    
    return {
        "status": "success", 
        "message": "Login successful", 
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

async def register_user(user_data: dict, db: Session):
    email = user_data.get("email")
    password = user_data.get("password")
    full_name = user_data.get("full_name")
    
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    # 2. Create new user
    new_user = User(
        email=email,
        hashed_password=password, # Use hashing in production
        full_name=full_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "success", 
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "email": new_user.email
        }
    }
