from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password: str
    role: str = "student"  # student or admin
    joinDate: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    lastActive: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    banned: bool = False

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    joinDate: str
    lastActive: str
    banned: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class FocusSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    duration: int  # in minutes
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    taskTag: Optional[str] = None

class FocusSessionCreate(BaseModel):
    duration: int
    taskTag: Optional[str] = None

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    title: str
    subject: Optional[str] = None
    dueDate: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    completed: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    title: str
    subject: Optional[str] = None
    dueDate: Optional[str] = None
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    dueDate: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

class Note(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    uploaderName: str
    title: str
    subject: Optional[str] = None
    content: Optional[str] = None  # For text notes
    fileData: Optional[str] = None  # Base64 encoded file
    fileName: Optional[str] = None
    fileType: Optional[str] = None
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    downloads: int = 0

class NoteCreate(BaseModel):
    title: str
    subject: Optional[str] = None
    content: Optional[str] = None
    fileData: Optional[str] = None
    fileName: Optional[str] = None
    fileType: Optional[str] = None

class CollabRoom(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    createdBy: str
    createdByName: str
    members: List[str] = Field(default_factory=list)
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CollabRoomCreate(BaseModel):
    topic: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    roomId: str
    sender: str
    senderName: str
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MessageCreate(BaseModel):
    text: str

class MentorChat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    sessionId: str
    role: str  # user or assistant
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MentorChatCreate(BaseModel):
    sessionId: str
    message: str

class AdminLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    adminId: str
    adminName: str
    actionType: str
    target: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminAction(BaseModel):
    actionType: str
    target: str

class UpdateRole(BaseModel):
    role: str

class SummarizeRequest(BaseModel):
    text: str

# ============ AUTH UTILITIES ============

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )
    
    user_dict = new_user.model_dump()
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.id})
    
    user_response = UserResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        joinDate=new_user.joinDate,
        lastActive=new_user.lastActive,
        banned=new_user.banned
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username}, {"_id": 0})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.get("banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been banned"
        )
    
    # Update last active
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"lastActive": datetime.now(timezone.utc).isoformat()}}
    )
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        joinDate=user["joinDate"],
        lastActive=user["lastActive"],
        banned=user.get("banned", False)
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ============ FOCUS ROUTES ============

@api_router.post("/focus/sessions", response_model=FocusSession)
async def create_focus_session(
    session: FocusSessionCreate,
    current_user: dict = Depends(get_current_user)
):
    new_session = FocusSession(
        userId=current_user["id"],
        duration=session.duration,
        taskTag=session.taskTag
    )
    session_dict = new_session.model_dump()
    await db.focusSessions.insert_one(session_dict)
    return new_session

@api_router.get("/focus/sessions", response_model=List[FocusSession])
async def get_focus_sessions(current_user: dict = Depends(get_current_user)):
    sessions = await db.focusSessions.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).sort("date", -1).to_list(1000)
    return sessions

# ============ TASK ROUTES ============

@api_router.post("/tasks", response_model=Task)
async def create_task(
    task: TaskCreate,
    current_user: dict = Depends(get_current_user)
):
    new_task = Task(
        userId=current_user["id"],
        **task.model_dump()
    )
    task_dict = new_task.model_dump()
    await db.tasks.insert_one(task_dict)
    return new_task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).to_list(1000)
    return tasks

@api_router.patch("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.tasks.find_one_and_update(
        {"id": task_id, "userId": current_user["id"]},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return Task(**result)

@api_router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await db.tasks.delete_one({"id": task_id, "userId": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ============ NOTES ROUTES ============

@api_router.post("/notes", response_model=Note)
async def create_note(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user)
):
    new_note = Note(
        userId=current_user["id"],
        uploaderName=current_user["name"],
        **note.model_dump()
    )
    note_dict = new_note.model_dump()
    await db.notes.insert_one(note_dict)
    return new_note

@api_router.get("/notes", response_model=List[Note])
async def get_notes(current_user: dict = Depends(get_current_user)):
    notes = await db.notes.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    return notes

@api_router.get("/notes/{note_id}", response_model=Note)
async def get_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Increment download count
    note = await db.notes.find_one_and_update(
        {"id": note_id},
        {"$inc": {"downloads": 1}},
        return_document=True,
        projection={"_id": 0}
    )
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return Note(**note)

@api_router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Users can only delete their own notes unless they're admin
    query = {"id": note_id}
    if current_user["role"] != "admin":
        query["userId"] = current_user["id"]
    
    result = await db.notes.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

# ============ COLLAB ROUTES ============

@api_router.post("/collab/rooms", response_model=CollabRoom)
async def create_room(
    room: CollabRoomCreate,
    current_user: dict = Depends(get_current_user)
):
    new_room = CollabRoom(
        topic=room.topic,
        createdBy=current_user["id"],
        createdByName=current_user["name"],
        members=[current_user["id"]]
    )
    room_dict = new_room.model_dump()
    await db.collabRooms.insert_one(room_dict)
    return new_room

@api_router.get("/collab/rooms", response_model=List[CollabRoom])
async def get_rooms(current_user: dict = Depends(get_current_user)):
    rooms = await db.collabRooms.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return rooms

@api_router.post("/collab/rooms/{room_id}/join")
async def join_room(
    room_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await db.collabRooms.update_one(
        {"id": room_id},
        {"$addToSet": {"members": current_user["id"]}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"message": "Joined room successfully"}

@api_router.get("/collab/rooms/{room_id}/messages", response_model=List[Message])
async def get_messages(
    room_id: str,
    current_user: dict = Depends(get_current_user)
):
    messages = await db.messages.find(
        {"roomId": room_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    return messages

@api_router.post("/collab/rooms/{room_id}/messages", response_model=Message)
async def send_message(
    room_id: str,
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    new_message = Message(
        roomId=room_id,
        sender=current_user["id"],
        senderName=current_user["name"],
        text=message.text
    )
    message_dict = new_message.model_dump()
    await db.messages.insert_one(message_dict)
    return new_message

# ============ AI MENTOR ROUTES ============

@api_router.post("/ai/mentor")
async def ai_mentor_chat(
    chat_request: MentorChatCreate,
    current_user: dict = Depends(get_current_user)
):
    # Save user message
    user_chat = MentorChat(
        userId=current_user["id"],
        sessionId=chat_request.sessionId,
        role="user",
        message=chat_request.message
    )
    await db.mentorChats.insert_one(user_chat.model_dump())
    
    # Get chat history for context
    chat_history = await db.mentorChats.find(
        {"userId": current_user["id"], "sessionId": chat_request.sessionId},
        {"_id": 0}
    ).sort("timestamp", 1).limit(10).to_list(10)
    
    try:
        # Initialize LLM chat
        llm_chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=chat_request.sessionId,
            system_message="You are a helpful AI study mentor. Help students with study strategies, motivation, time management, and understanding concepts. Be encouraging and supportive."
        ).with_model("openai", "gpt-4o-mini")
        
        # Send message
        user_message = UserMessage(text=chat_request.message)
        response = await llm_chat.send_message(user_message)
        
        # Save assistant response
        assistant_chat = MentorChat(
            userId=current_user["id"],
            sessionId=chat_request.sessionId,
            role="assistant",
            message=response
        )
        await db.mentorChats.insert_one(assistant_chat.model_dump())
        
        return {"response": response}
    except Exception as e:
        logging.error(f"AI Mentor error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

@api_router.get("/ai/mentor/history/{session_id}", response_model=List[MentorChat])
async def get_mentor_history(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    history = await db.mentorChats.find(
        {"userId": current_user["id"], "sessionId": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    return history

@api_router.post("/ai/summarize")
async def summarize_content(
    request: SummarizeRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        llm_chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id="summary-" + str(uuid.uuid4()),
            system_message="You are a text summarizer. Provide concise 3-line summaries."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=f"Summarize this in 3 lines:\n\n{request.text}")
        response = await llm_chat.send_message(user_message)
        
        return {"summary": response}
    except Exception as e:
        logging.error(f"AI Summarize error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

# ============ ADMIN ROUTES ============

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]

@api_router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_update: UpdateRole,
    admin_user: dict = Depends(get_admin_user)
):
    if role_update.role not in ["student", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role_update.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log action
    log = AdminLog(
        adminId=admin_user["id"],
        adminName=admin_user["name"],
        actionType="update_role",
        target=user_id
    )
    await db.adminLogs.insert_one(log.model_dump())
    
    return {"message": "User role updated"}

@api_router.patch("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"banned": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    log = AdminLog(
        adminId=admin_user["id"],
        adminName=admin_user["name"],
        actionType="ban_user",
        target=user_id
    )
    await db.adminLogs.insert_one(log.model_dump())
    
    return {"message": "User banned"}

@api_router.patch("/admin/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"banned": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    log = AdminLog(
        adminId=admin_user["id"],
        adminName=admin_user["name"],
        actionType="unban_user",
        target=user_id
    )
    await db.adminLogs.insert_one(log.model_dump())
    
    return {"message": "User unbanned"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: dict = Depends(get_admin_user)
):
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    log = AdminLog(
        adminId=admin_user["id"],
        adminName=admin_user["name"],
        actionType="delete_user",
        target=user_id
    )
    await db.adminLogs.insert_one(log.model_dump())
    
    return {"message": "User deleted"}

@api_router.get("/admin/analytics")
async def get_analytics(admin_user: dict = Depends(get_admin_user)):
    # Get counts
    total_users = await db.users.count_documents({})
    total_notes = await db.notes.count_documents({})
    total_tasks = await db.tasks.count_documents({})
    total_rooms = await db.collabRooms.count_documents({})
    total_sessions = await db.focusSessions.count_documents({})
    
    # Get recent users (last 7 days)
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_users = await db.users.count_documents({"joinDate": {"$gte": seven_days_ago}})
    
    # Get all focus sessions for chart data
    sessions = await db.focusSessions.find({}, {"_id": 0, "duration": 1, "date": 1}).to_list(10000)
    
    # Get all tasks for completion stats
    completed_tasks = await db.tasks.count_documents({"completed": True})
    
    return {
        "totalUsers": total_users,
        "newUsers": new_users,
        "totalNotes": total_notes,
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "totalRooms": total_rooms,
        "totalSessions": total_sessions,
        "focusSessions": sessions
    }

@api_router.get("/admin/logs", response_model=List[AdminLog])
async def get_admin_logs(admin_user: dict = Depends(get_admin_user)):
    logs = await db.adminLogs.find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)
    return logs

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()