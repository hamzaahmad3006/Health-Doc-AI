from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.controllers import auth_controller

router = APIRouter()

@router.post("/login")
async def login(credentials: dict, db: Session = Depends(get_db)):
    return await auth_controller.login_user(credentials, db)

@router.post("/register")
async def register(user_data: dict, db: Session = Depends(get_db)):
    return await auth_controller.register_user(user_data, db)
