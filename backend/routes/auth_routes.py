from fastapi import APIRouter
from controllers import auth_controller

router = APIRouter()

@router.post("/login")
async def login(credentials: dict):
    return await auth_controller.login_user(credentials)

@router.post("/register")
async def register(user_data: dict):
    return await auth_controller.register_user(user_data)
