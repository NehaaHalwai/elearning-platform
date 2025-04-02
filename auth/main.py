from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from schemas.auth import TokenSchema, LoginSchema
from jose import JWTError, jwt
from typing import Annotated, List
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from utils.database import connect_to_mongo, close_mongo_connection, get_collection
from utils.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from models.user import User, UserCreate

app = FastAPI(title="Auth Service")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Add startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Auth Service API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/register")
async def register_user(user: UserCreate):
    users_collection = get_collection("users")
    
    # Check if user exists
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user with hashed password
    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role
    )
    
    # Save user to database
    await users_collection.insert_one(new_user.dict())
    return {"message": "User registered successfully"}

# Update login to include role in token
@app.post("/login", response_model=TokenSchema)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = get_collection("users")
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, str(SECRET_KEY), algorithms=[str(ALGORITHM)])
        email = payload.get("sub")
        if not isinstance(email, str):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    users_collection = get_collection("users")
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me")
async def read_users_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return current_user

# Admin only endpoint to manage instructors
@app.post("/instructors", response_model=dict)
async def create_instructor(
    instructor: User,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can add instructors"
        )
    
    instructor.role = "instructor"
    users_collection = get_collection("users")
    
    if await users_collection.find_one({"email": instructor.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    instructor.hashed_password = get_password_hash(instructor.hashed_password)
    await users_collection.insert_one(instructor.dict())
    return {"message": "Instructor created successfully"}

@app.get("/instructors", response_model=List[dict])
async def list_instructors(
    current_user: Annotated[dict, Depends(get_current_user)]
):
    if current_user.get("role") not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    users_collection = get_collection("users")
    instructors = await users_collection.find({"role": "instructor"}).to_list(None)
    return instructors

@app.delete("/instructors/{instructor_id}")
async def remove_instructor(
    instructor_id: str,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can remove instructors"
        )
    
    users_collection = get_collection("users")
    result = await users_collection.delete_one({"_id": instructor_id, "role": "instructor"})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Instructor not found")
    
    return {"message": "Instructor removed successfully"}

# Get dashboard based on role
@app.get("/dashboard")
async def get_dashboard(current_user: Annotated[dict, Depends(get_current_user)]):
    role = current_user.get("role", "student")
    if role == "admin":
        return {
            "dashboard": "admin",
            "features": ["manage_instructors", "view_statistics", "system_settings"]
        }
    elif role == "instructor":
        return {
            "dashboard": "instructor",
            "features": ["manage_courses", "view_students", "create_content"]
        }
    else:
        return {
            "dashboard": "student",
            "features": ["view_courses", "progress", "assignments"]
        }