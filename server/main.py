from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import uuid
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote_plus

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from sqlmodel import Field, Session, SQLModel, create_engine, select
from sqlalchemy import inspect, text

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

# Load repo-level env files so local startup does not require hardcoded secrets.
load_dotenv(PROJECT_DIR / ".env")
load_dotenv(PROJECT_DIR / ".env.local", override=True)

SECRET_KEY = os.getenv("GORUNNERS_SECRET", "change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
UPLOAD_DIR = os.getenv("GORUNNERS_UPLOADS", str(BASE_DIR / "uploads"))
PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390000

DIFY_BASE_URL = os.getenv("DIFY_BASE_URL", "").rstrip("/")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def build_database_url() -> str:
    explicit_url = os.getenv("GORUNNERS_DB", "").strip()
    if explicit_url:
        return explicit_url

    mysql_host = os.getenv("MYSQL_HOST", "").strip()
    if mysql_host:
        mysql_port = os.getenv("MYSQL_PORT", "3306").strip() or "3306"
        mysql_user = quote_plus(os.getenv("MYSQL_USER", "root").strip() or "root")
        mysql_password = quote_plus(os.getenv("MYSQL_PASSWORD", ""))
        mysql_database = os.getenv("MYSQL_DATABASE", "gorunners").strip() or "gorunners"
        credentials = mysql_user if not mysql_password else f"{mysql_user}:{mysql_password}"
        return f"mysql+pymysql://{credentials}@{mysql_host}:{mysql_port}/{mysql_database}?charset=utf8mb4"

    return f"sqlite:///{BASE_DIR / 'gorunners.db'}"


DATABASE_URL = build_database_url()
DATABASE_BACKEND = "mysql" if DATABASE_URL.startswith("mysql") else "sqlite"


def now_utc() -> datetime:
    return datetime.utcnow()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PASSWORD_ITERATIONS)
    encoded = base64.urlsafe_b64encode(digest).decode("utf-8")
    return f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}${salt}${encoded}"


def verify_password(password: str, hashed: str) -> bool:
    parts = hashed.split("$")
    if len(parts) != 4 or parts[0] != PASSWORD_SCHEME:
        return False
    try:
        iterations = int(parts[1])
        salt = parts[2]
        expected = parts[3]
    except (ValueError, TypeError):
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    actual = base64.urlsafe_b64encode(digest).decode("utf-8")
    return hmac.compare_digest(actual, expected)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = now_utc() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def encode_list(value: Optional[list]) -> str:
    return json.dumps(value or [])


def decode_list(value: Optional[str]) -> list:
    if not value:
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return []


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    password_hash: str
    role: str = "user"
    is_active: bool = True
    last_login_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    name_zh: str = ""
    description: str
    description_zh: str = ""
    time_label: str
    time_label_zh: str = ""
    location: str
    location_zh: str = ""
    distance: float
    level: str
    pace: str
    capacity: int
    spots_left: int
    tags_json: str = "[]"
    tags_zh_json: str = "[]"
    lat: float
    lng: float
    route_coords_json: str = "[]"
    created_by: Optional[int] = None
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)


class Checkpoint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(index=True)
    name: str
    name_zh: str = ""
    type: str
    lat: float
    lng: float
    order_index: int
    recommended: bool = False


class Registration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(index=True)
    user_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=now_utc)


class Checkin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: Optional[int] = Field(default=None, index=True)
    spot_id: Optional[int] = Field(default=None, index=True)
    user_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=now_utc)


class Spot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    name_zh: str = ""
    description: str
    description_zh: str = ""
    vibe: str
    vibe_zh: str = ""
    lat: float
    lng: float


class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    spot_id: int = Field(index=True)
    user_id: int = Field(index=True)
    text: str
    image_url: str = ""
    likes: int = 0
    created_at: datetime = Field(default_factory=now_utc)


class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(index=True)
    user_id: int = Field(index=True)
    text: str
    created_at: datetime = Field(default_factory=now_utc)


class AdminActionLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_user_id: int = Field(index=True)
    action_type: str
    target_type: str
    target_id: Optional[int] = Field(default=None, index=True)
    note: str = ""
    created_at: datetime = Field(default_factory=now_utc)


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(SQLModel):
    email: str
    name: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class EventInput(SQLModel):
    name: str
    name_zh: str = ""
    description: str
    description_zh: str = ""
    time_label: str
    time_label_zh: str = ""
    location: str
    location_zh: str = ""
    distance: float
    level: str
    pace: str
    capacity: int
    tags: List[str] = []
    tags_zh: List[str] = []
    lat: float
    lng: float
    route_coords: List[List[float]] = []


class CheckpointInput(SQLModel):
    name: str
    name_zh: str = ""
    type: str
    lat: float
    lng: float
    order_index: int
    recommended: bool = False


class SpotInput(SQLModel):
    name: str
    name_zh: str = ""
    description: str
    description_zh: str = ""
    vibe: str
    vibe_zh: str = ""
    lat: float
    lng: float


class PostInput(SQLModel):
    text: str
    image_url: str = ""


class CommentInput(SQLModel):
    text: str


class RoleUpdate(SQLModel):
    role: str


class AdminUserUpdate(SQLModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AiChatRequest(SQLModel):
    message: str
    conversation_id: str = ""
    user: str = "gorunners"
    inputs: dict = {}


class AiChatResponse(SQLModel):
    answer: str
    conversation_id: str = ""


def dify_request(path: str, payload: Optional[dict] = None, method: str = "GET") -> dict:
    if not DIFY_BASE_URL or not DIFY_API_KEY:
        raise HTTPException(status_code=503, detail="AI not configured")

    url = f"{DIFY_BASE_URL}{path}"
    body = None
    headers = {"Authorization": f"Bearer {DIFY_API_KEY}"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        try:
            raw = error.read().decode("utf-8")
            parsed = json.loads(raw)
            detail = parsed.get("message") or parsed.get("detail") or raw
        except Exception:
            detail = "AI request failed"
        raise HTTPException(status_code=502, detail=detail)
    except urllib.error.URLError:
        raise HTTPException(status_code=502, detail="AI service unreachable")

    try:
        return json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Invalid AI response")


engine_kwargs = {"echo": False}
if DATABASE_BACKEND == "sqlite":
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(DATABASE_URL, **engine_kwargs)

app = FastAPI(title="GoRunners API", version="1.0.0")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def quote_identifier(identifier: str) -> str:
    if DATABASE_BACKEND == "mysql":
        return f"`{identifier}`"
    return f'"{identifier}"'


def ensure_legacy_columns() -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    if "user" not in existing_tables:
        return

    user_columns = {column["name"] for column in inspector.get_columns("user")}
    user_table = quote_identifier("user")

    statements = []
    if "is_active" not in user_columns:
        statements.append(
            f"ALTER TABLE {user_table} ADD COLUMN {quote_identifier('is_active')} BOOLEAN NOT NULL DEFAULT 1"
        )
    if "last_login_at" not in user_columns:
        statements.append(
            f"ALTER TABLE {user_table} ADD COLUMN {quote_identifier('last_login_at')} DATETIME"
        )
    if "updated_at" not in user_columns:
        statements.append(
            f"ALTER TABLE {user_table} ADD COLUMN {quote_identifier('updated_at')} DATETIME"
        )

    event_columns = {column["name"] for column in inspector.get_columns("event")} if "event" in existing_tables else set()
    event_table = quote_identifier("event")
    if "updated_at" not in event_columns and "event" in existing_tables:
        statements.append(
            f"ALTER TABLE {event_table} ADD COLUMN {quote_identifier('updated_at')} DATETIME"
        )

    if not statements:
        with engine.begin() as connection:
            connection.execute(
                text(
                    f"UPDATE {user_table} SET {quote_identifier('is_active')} = 1 "
                    f"WHERE {quote_identifier('is_active')} IS NULL"
                )
            )
            connection.execute(
                text(
                    f"UPDATE {user_table} SET {quote_identifier('updated_at')} = {quote_identifier('created_at')} "
                    f"WHERE {quote_identifier('updated_at')} IS NULL"
                )
            )
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
        connection.execute(
            text(
                f"UPDATE {user_table} SET {quote_identifier('is_active')} = 1 "
                f"WHERE {quote_identifier('is_active')} IS NULL"
            )
        )
        connection.execute(
            text(
                f"UPDATE {user_table} SET {quote_identifier('updated_at')} = {quote_identifier('created_at')} "
                f"WHERE {quote_identifier('updated_at')} IS NULL"
            )
        )
        if "event" in existing_tables:
            connection.execute(
                text(
                    f"UPDATE {event_table} SET {quote_identifier('updated_at')} = {quote_identifier('created_at')} "
                    f"WHERE {quote_identifier('updated_at')} IS NULL"
                )
            )


def get_session():
    with Session(engine) as session:
        yield session


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def serialize_user(user: User, registration_count: int = 0, post_count: int = 0, event_count: int = 0) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "is_active": user.is_active,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "registration_count": registration_count,
        "post_count": post_count,
        "event_count": event_count,
    }


def log_admin_action(
    session: Session,
    admin_user_id: int,
    action_type: str,
    target_type: str,
    target_id: Optional[int] = None,
    note: str = "",
) -> None:
    session.add(
        AdminActionLog(
            admin_user_id=admin_user_id,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            note=note,
        )
    )


def get_registration_count(session: Session, event_id: int) -> int:
    return len(session.exec(select(Registration).where(Registration.event_id == event_id)).all())


def event_to_dict(event: Event) -> dict:
    return {
        "id": event.id,
        "name": event.name,
        "name_zh": event.name_zh,
        "description": event.description,
        "description_zh": event.description_zh,
        "time_label": event.time_label,
        "time_label_zh": event.time_label_zh,
        "location": event.location,
        "location_zh": event.location_zh,
        "distance": event.distance,
        "level": event.level,
        "pace": event.pace,
        "capacity": event.capacity,
        "spots_left": event.spots_left,
        "tags": decode_list(event.tags_json),
        "tags_zh": decode_list(event.tags_zh_json),
        "lat": event.lat,
        "lng": event.lng,
        "route_coords": decode_list(event.route_coords_json),
    }


def spot_to_dict(spot: Spot) -> dict:
    return {
        "id": spot.id,
        "name": spot.name,
        "name_zh": spot.name_zh,
        "description": spot.description,
        "description_zh": spot.description_zh,
        "vibe": spot.vibe,
        "vibe_zh": spot.vibe_zh,
        "lat": spot.lat,
        "lng": spot.lng,
    }


def serialize_event_admin(event: Event, registration_count: int, checkpoint_count: int, created_by_name: str = "") -> dict:
    data = event_to_dict(event)
    data.update(
        {
            "created_by": event.created_by,
            "created_by_name": created_by_name,
            "created_at": event.created_at.isoformat() if event.created_at else None,
            "updated_at": event.updated_at.isoformat() if event.updated_at else None,
            "registration_count": registration_count,
            "checkpoint_count": checkpoint_count,
        }
    )
    return data


def serialize_post_admin(
    post: Post,
    comment_count: int,
    user_name: str = "",
    user_email: str = "",
    spot_name: str = "",
) -> dict:
    return {
        "id": post.id,
        "spot_id": post.spot_id,
        "spot_name": spot_name,
        "user_id": post.user_id,
        "user_name": user_name,
        "user_email": user_email,
        "text": post.text,
        "image_url": post.image_url,
        "likes": post.likes,
        "comment_count": comment_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
    }


def seed_data(session: Session) -> None:
    admin_email = os.getenv("GORUNNERS_ADMIN_EMAIL", "admin@gorunners.com")
    admin_password = os.getenv("GORUNNERS_ADMIN_PASSWORD", "gorunners123")
    existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
    if existing_admin:
        existing_admin.role = "admin"
        existing_admin.is_active = True
        existing_admin.password_hash = hash_password(admin_password)
        existing_admin.updated_at = now_utc()
        session.add(existing_admin)
        session.commit()
    else:
        admin = User(
            email=admin_email,
            name="Admin",
            password_hash=hash_password(admin_password),
            role="admin",
            is_active=True,
        )
        session.add(admin)
        session.commit()

    if session.exec(select(Event)).first():
        return

    seed_events = [
        {
            "name": "Sunset 5K Campus Run",
            "name_zh": "",
            "description": "A welcoming lakeside loop with a guided warm-up and friendly pacing.",
            "description_zh": "",
            "time_label": "18:30 - Thu",
            "time_label_zh": "",
            "location": "Dushu Lake Gate A",
            "location_zh": "",
            "distance": 5.0,
            "level": "Beginner",
            "pace": "6'30\"-7'30\" / km",
            "capacity": 36,
            "tags": ["Beginner Friendly", "Social", "Campus"],
            "tags_zh": [],
            "lat": 31.264,
            "lng": 120.739,
            "route_coords": [
                [31.264, 120.739],
                [31.262, 120.744],
                [31.268, 120.746],
                [31.27, 120.739],
                [31.266, 120.732],
                [31.264, 120.739],
            ],
        },
        {
            "name": "Beginner Night Jog",
            "name_zh": "",
            "description": "Soft lighting, calm pace, and an easy loop around the field.",
            "description_zh": "",
            "time_label": "19:15 - Fri",
            "time_label_zh": "",
            "location": "Moonlight Track Field",
            "location_zh": "",
            "distance": 3.5,
            "level": "Beginner",
            "pace": "7'00\"-8'00\" / km",
            "capacity": 24,
            "tags": ["Night Run", "Stress Relief"],
            "tags_zh": [],
            "lat": 31.301,
            "lng": 120.62,
            "route_coords": [
                [31.301, 120.62],
                [31.302, 120.623],
                [31.303, 120.621],
                [31.301, 120.618],
                [31.301, 120.62],
            ],
        },
        {
            "name": "Team Challenge Run",
            "name_zh": "",
            "description": "Group-based run with mini challenges at checkpoints.",
            "description_zh": "",
            "time_label": "08:00 - Sat",
            "time_label_zh": "",
            "location": "Industrial Park Greenway",
            "location_zh": "",
            "distance": 8.0,
            "level": "Intermediate",
            "pace": "5'30\"-6'30\" / km",
            "capacity": 40,
            "tags": ["Team", "Challenge", "Greenway"],
            "tags_zh": [],
            "lat": 31.315,
            "lng": 120.7,
            "route_coords": [
                [31.315, 120.7],
                [31.318, 120.703],
                [31.319, 120.695],
                [31.314, 120.692],
                [31.315, 120.7],
            ],
        },
    ]

    for item in seed_events:
        event = Event(
            name=item["name"],
            name_zh=item["name_zh"],
            description=item["description"],
            description_zh=item["description_zh"],
            time_label=item["time_label"],
            time_label_zh=item["time_label_zh"],
            location=item["location"],
            location_zh=item["location_zh"],
            distance=item["distance"],
            level=item["level"],
            pace=item["pace"],
            capacity=item["capacity"],
            spots_left=item["capacity"],
            tags_json=encode_list(item["tags"]),
            tags_zh_json=encode_list(item["tags_zh"]),
            lat=item["lat"],
            lng=item["lng"],
            route_coords_json=encode_list(item["route_coords"]),
        )
        session.add(event)

    seed_spots = [
        {
            "name": "Dushu Lake",
            "name_zh": "",
            "description": "Lakeside breeze, sunset reflections, easy loops.",
            "description_zh": "",
            "vibe": "Campus Lakeside",
            "vibe_zh": "",
            "lat": 31.264,
            "lng": 120.739,
        },
        {
            "name": "Jinji Lake",
            "name_zh": "",
            "description": "Wide paths and city skyline views for group runs.",
            "description_zh": "",
            "vibe": "City Skyline",
            "vibe_zh": "",
            "lat": 31.311,
            "lng": 120.682,
        },
        {
            "name": "Pingjiang Road",
            "name_zh": "",
            "description": "Historic alleys with photo checkpoints.",
            "description_zh": "",
            "vibe": "Heritage Story",
            "vibe_zh": "",
            "lat": 31.312,
            "lng": 120.625,
        },
    ]

    for spot_item in seed_spots:
        spot = Spot(
            name=spot_item["name"],
            name_zh=spot_item["name_zh"],
            description=spot_item["description"],
            description_zh=spot_item["description_zh"],
            vibe=spot_item["vibe"],
            vibe_zh=spot_item["vibe_zh"],
            lat=spot_item["lat"],
            lng=spot_item["lng"],
        )
        session.add(spot)

    session.commit()


@app.on_event("startup")
def on_startup() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    SQLModel.metadata.create_all(engine)
    ensure_legacy_columns()
    with Session(engine) as session:
        seed_data(session)


@app.get("/health")
def health():
    return {"status": "ok", "database_backend": DATABASE_BACKEND}


@app.post("/ai/chat", response_model=AiChatResponse)
def ai_chat(payload: AiChatRequest):
    data = dify_request(
        "/chat-messages",
        payload={
            "inputs": payload.inputs or {},
            "query": payload.message,
            "response_mode": "blocking",
            "conversation_id": payload.conversation_id,
            "user": payload.user or "gorunners",
        },
        method="POST",
    )

    answer = data.get("answer") or data.get("message") or ""
    conversation_id = data.get("conversation_id") or payload.conversation_id or ""
    return AiChatResponse(answer=answer, conversation_id=conversation_id)


@app.get("/ai/parameters")
def ai_parameters():
    return dify_request("/parameters")


@app.post("/auth/register", response_model=Token)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        name=user_in.name,
        password_hash=hash_password(user_in.password),
        role="user",
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@app.post("/auth/login", response_model=Token)
def login(user_in: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    user.last_login_at = now_utc()
    user.updated_at = now_utc()
    session.add(user)
    session.commit()
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
    }


@app.get("/admin/dashboard")
def admin_dashboard(session: Session = Depends(get_session), admin_user: User = Depends(require_admin)):
    users = session.exec(select(User)).all()
    events = session.exec(select(Event)).all()
    posts = session.exec(select(Post)).all()
    registrations = session.exec(select(Registration)).all()
    comments = session.exec(select(Comment)).all()
    recent_logs = session.exec(select(AdminActionLog).order_by(AdminActionLog.created_at.desc())).all()[:8]

    user_map = {user.id: user for user in users}
    recent_actions = [
        {
            "id": log.id,
            "action_type": log.action_type,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "note": log.note,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "admin_name": user_map.get(log.admin_user_id).name if user_map.get(log.admin_user_id) else "Admin",
        }
        for log in recent_logs
    ]

    return {
        "database_backend": DATABASE_BACKEND,
        "viewer": serialize_user(admin_user),
        "stats": {
            "user_total": len(users),
            "active_user_total": len([user for user in users if user.is_active]),
            "admin_total": len([user for user in users if user.role == "admin"]),
            "event_total": len(events),
            "registration_total": len(registrations),
            "post_total": len(posts),
            "comment_total": len(comments),
        },
        "recent_actions": recent_actions,
    }


@app.get("/admin/users")
def list_users(session: Session = Depends(get_session), _: User = Depends(require_admin)):
    users = session.exec(select(User).order_by(User.created_at.desc())).all()
    registrations = session.exec(select(Registration)).all()
    posts = session.exec(select(Post)).all()
    events = session.exec(select(Event)).all()

    registration_counts: dict[int, int] = {}
    post_counts: dict[int, int] = {}
    event_counts: dict[int, int] = {}

    for registration in registrations:
        registration_counts[registration.user_id] = registration_counts.get(registration.user_id, 0) + 1
    for post in posts:
        post_counts[post.user_id] = post_counts.get(post.user_id, 0) + 1
    for event in events:
        if event.created_by:
            event_counts[event.created_by] = event_counts.get(event.created_by, 0) + 1

    return [
        serialize_user(
            user,
            registration_count=registration_counts.get(user.id or 0, 0),
            post_count=post_counts.get(user.id or 0, 0),
            event_count=event_counts.get(user.id or 0, 0),
        )
        for user in users
    ]


@app.patch("/admin/users/{user_id}")
def update_admin_user(
    user_id: int,
    user_in: AdminUserUpdate,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.role is not None:
        if user_in.role not in {"admin", "user"}:
            raise HTTPException(status_code=400, detail="Invalid role")
        if user.id == admin_user.id and user_in.role != "admin":
            raise HTTPException(status_code=400, detail="Cannot remove your own admin role")
        user.role = user_in.role

    if user_in.is_active is not None:
        if user.id == admin_user.id and user_in.is_active is False:
            raise HTTPException(status_code=400, detail="Cannot disable your own account")
        user.is_active = user_in.is_active

    if user_in.name is not None and user_in.name.strip():
        user.name = user_in.name.strip()

    user.updated_at = now_utc()
    session.add(user)
    log_admin_action(
        session,
        admin_user_id=admin_user.id or 0,
        action_type="update_user",
        target_type="user",
        target_id=user.id,
        note=f"role={user.role}, active={user.is_active}",
    )
    session.commit()
    registration_count = len(session.exec(select(Registration).where(Registration.user_id == user.id)).all())
    post_count = len(session.exec(select(Post).where(Post.user_id == user.id)).all())
    event_count = len(session.exec(select(Event).where(Event.created_by == user.id)).all())
    return serialize_user(user, registration_count=registration_count, post_count=post_count, event_count=event_count)


@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_in: RoleUpdate,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
):
    return update_admin_user(
        user_id=user_id,
        user_in=AdminUserUpdate(role=role_in.role),
        session=session,
        admin_user=admin_user,
    )


@app.get("/admin/events")
def admin_list_events(session: Session = Depends(get_session), _: User = Depends(require_admin)):
    events = session.exec(select(Event).order_by(Event.created_at.desc())).all()
    checkpoints = session.exec(select(Checkpoint)).all()
    users = session.exec(select(User)).all()

    checkpoint_counts: dict[int, int] = {}
    for checkpoint in checkpoints:
        checkpoint_counts[checkpoint.event_id] = checkpoint_counts.get(checkpoint.event_id, 0) + 1

    user_map = {user.id: user.name for user in users}
    return [
        serialize_event_admin(
            event,
            registration_count=get_registration_count(session, event.id or 0),
            checkpoint_count=checkpoint_counts.get(event.id or 0, 0),
            created_by_name=user_map.get(event.created_by, ""),
        )
        for event in events
    ]


@app.get("/admin/posts")
def admin_list_posts(session: Session = Depends(get_session), _: User = Depends(require_admin)):
    posts = session.exec(select(Post).order_by(Post.created_at.desc())).all()
    comments = session.exec(select(Comment)).all()
    users = session.exec(select(User)).all()
    spots = session.exec(select(Spot)).all()

    comment_counts: dict[int, int] = {}
    for comment in comments:
        comment_counts[comment.post_id] = comment_counts.get(comment.post_id, 0) + 1

    user_map = {user.id: user for user in users}
    spot_map = {spot.id: spot for spot in spots}
    return [
        serialize_post_admin(
            post,
            comment_count=comment_counts.get(post.id or 0, 0),
            user_name=user_map.get(post.user_id).name if user_map.get(post.user_id) else "",
            user_email=user_map.get(post.user_id).email if user_map.get(post.user_id) else "",
            spot_name=spot_to_dict(spot_map.get(post.spot_id)).get("name", "") if spot_map.get(post.spot_id) else "",
        )
        for post in posts
    ]


@app.get("/events")
def list_events(session: Session = Depends(get_session)):
    events = session.exec(select(Event)).all()
    return [event_to_dict(event) for event in events]


@app.get("/events/{event_id}")
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_to_dict(event)


@app.post("/events", dependencies=[Depends(require_admin)])
def create_event(event_in: EventInput, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    event = Event(
        name=event_in.name,
        name_zh=event_in.name_zh,
        description=event_in.description,
        description_zh=event_in.description_zh,
        time_label=event_in.time_label,
        time_label_zh=event_in.time_label_zh,
        location=event_in.location,
        location_zh=event_in.location_zh,
        distance=event_in.distance,
        level=event_in.level,
        pace=event_in.pace,
        capacity=event_in.capacity,
        spots_left=event_in.capacity,
        tags_json=encode_list(event_in.tags),
        tags_zh_json=encode_list(event_in.tags_zh),
        lat=event_in.lat,
        lng=event_in.lng,
        route_coords_json=encode_list(event_in.route_coords),
        created_by=user.id,
    )
    session.add(event)
    session.flush()
    log_admin_action(
        session,
        admin_user_id=user.id or 0,
        action_type="create_event",
        target_type="event",
        target_id=event.id,
        note=event.name,
    )
    session.commit()
    session.refresh(event)
    return event_to_dict(event)


@app.put("/events/{event_id}", dependencies=[Depends(require_admin)])
def update_event(event_id: int, event_in: EventInput, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.name = event_in.name
    event.name_zh = event_in.name_zh
    event.description = event_in.description
    event.description_zh = event_in.description_zh
    event.time_label = event_in.time_label
    event.time_label_zh = event_in.time_label_zh
    event.location = event_in.location
    event.location_zh = event_in.location_zh
    event.distance = event_in.distance
    event.level = event_in.level
    event.pace = event_in.pace
    event.capacity = event_in.capacity
    event.tags_json = encode_list(event_in.tags)
    event.tags_zh_json = encode_list(event_in.tags_zh)
    event.lat = event_in.lat
    event.lng = event_in.lng
    event.route_coords_json = encode_list(event_in.route_coords)
    event.updated_at = now_utc()
    registrations_used = get_registration_count(session, event_id)
    event.spots_left = max(event.capacity - registrations_used, 0)
    session.add(event)
    session.commit()
    return event_to_dict(event)


@app.delete("/events/{event_id}", dependencies=[Depends(require_admin)])
def delete_event(event_id: int, session: Session = Depends(get_session), admin_user: User = Depends(get_current_user)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    checkpoints = session.exec(select(Checkpoint).where(Checkpoint.event_id == event_id)).all()
    registrations = session.exec(select(Registration).where(Registration.event_id == event_id)).all()
    checkins = session.exec(select(Checkin).where(Checkin.event_id == event_id)).all()
    for checkpoint in checkpoints:
        session.delete(checkpoint)
    for registration in registrations:
        session.delete(registration)
    for checkin in checkins:
        session.delete(checkin)
    log_admin_action(
        session,
        admin_user_id=admin_user.id or 0,
        action_type="delete_event",
        target_type="event",
        target_id=event.id,
        note=event.name,
    )
    session.delete(event)
    session.commit()
    return {"status": "deleted"}


@app.post("/events/{event_id}/register")
def register_event(event_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    existing = session.exec(
        select(Registration).where(Registration.event_id == event_id, Registration.user_id == user.id)
    ).first()
    if existing:
        return {"status": "already_registered"}
    if event.spots_left <= 0:
        raise HTTPException(status_code=400, detail="No spots left")
    event.spots_left -= 1
    session.add(Registration(event_id=event_id, user_id=user.id))
    session.add(event)
    session.commit()
    return {"status": "registered", "spots_left": event.spots_left}


@app.post("/events/{event_id}/checkin")
def checkin_event(event_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.add(Checkin(event_id=event_id, user_id=user.id))
    session.commit()
    return {"status": "checked_in"}


@app.get("/events/{event_id}/checkpoints")
def list_checkpoints(event_id: int, session: Session = Depends(get_session)):
    checkpoints = session.exec(select(Checkpoint).where(Checkpoint.event_id == event_id)).all()
    return [checkpoint.model_dump() for checkpoint in checkpoints]


@app.post("/events/{event_id}/checkpoints", dependencies=[Depends(require_admin)])
def create_checkpoint(event_id: int, checkpoint_in: CheckpointInput, session: Session = Depends(get_session)):
    checkpoint = Checkpoint(
        event_id=event_id,
        name=checkpoint_in.name,
        name_zh=checkpoint_in.name_zh,
        type=checkpoint_in.type,
        lat=checkpoint_in.lat,
        lng=checkpoint_in.lng,
        order_index=checkpoint_in.order_index,
        recommended=checkpoint_in.recommended,
    )
    session.add(checkpoint)
    session.commit()
    session.refresh(checkpoint)
    return checkpoint


@app.post("/events/{event_id}/recommend-checkpoints", dependencies=[Depends(require_admin)])
def recommend_checkpoints(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    route = decode_list(event.route_coords_json)
    if len(route) < 2:
        raise HTTPException(status_code=400, detail="Route coordinates missing")

    def pick_point(index: int) -> tuple[float, float]:
        lat, lng = route[index]
        return float(lat), float(lng)

    targets = [
        ("Water Point", "", "water"),
        ("Photo Spot", "", "photo"),
        ("Motivation Check", "", "checkpoint"),
    ]

    created = []
    for idx, (name, name_zh, cp_type) in enumerate(targets):
        lat, lng = pick_point(min(idx + 1, len(route) - 1))
        checkpoint = Checkpoint(
            event_id=event_id,
            name=name,
            name_zh=name_zh,
            type=cp_type,
            lat=lat,
            lng=lng,
            order_index=idx + 1,
            recommended=True,
        )
        session.add(checkpoint)
        created.append(checkpoint)

    session.commit()
    return [checkpoint.model_dump() for checkpoint in created]


@app.get("/spots")
def list_spots(session: Session = Depends(get_session)):
    spots = session.exec(select(Spot)).all()
    return [spot_to_dict(spot) for spot in spots]


@app.post("/spots", dependencies=[Depends(require_admin)])
def create_spot(spot_in: SpotInput, session: Session = Depends(get_session)):
    spot = Spot(
        name=spot_in.name,
        name_zh=spot_in.name_zh,
        description=spot_in.description,
        description_zh=spot_in.description_zh,
        vibe=spot_in.vibe,
        vibe_zh=spot_in.vibe_zh,
        lat=spot_in.lat,
        lng=spot_in.lng,
    )
    session.add(spot)
    session.commit()
    session.refresh(spot)
    return spot_to_dict(spot)


@app.post("/spots/{spot_id}/checkin")
def checkin_spot(spot_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    spot = session.get(Spot, spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    session.add(Checkin(spot_id=spot_id, user_id=user.id))
    session.commit()
    return {"status": "checked_in"}


@app.get("/spots/{spot_id}/posts")
def list_posts(spot_id: int, session: Session = Depends(get_session)):
    posts = session.exec(select(Post).where(Post.spot_id == spot_id).order_by(Post.created_at.desc())).all()
    output = []
    for post in posts:
        comments = session.exec(select(Comment).where(Comment.post_id == post.id)).all()
        output.append(
            {
                "id": post.id,
                "spot_id": post.spot_id,
                "user_id": post.user_id,
                "text": post.text,
                "image_url": post.image_url,
                "likes": post.likes,
                "created_at": post.created_at.isoformat(),
                "comments": [comment.model_dump() for comment in comments],
            }
        )
    return output


@app.delete("/admin/posts/{post_id}")
def admin_delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    admin_user: User = Depends(require_admin),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = session.exec(select(Comment).where(Comment.post_id == post_id)).all()
    for comment in comments:
        session.delete(comment)

    note = post.text[:80]
    log_admin_action(
        session,
        admin_user_id=admin_user.id or 0,
        action_type="delete_post",
        target_type="post",
        target_id=post.id,
        note=note,
    )
    session.delete(post)
    session.commit()
    return {"status": "deleted"}


@app.post("/spots/{spot_id}/posts")
def create_post(spot_id: int, post_in: PostInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    spot = session.get(Spot, spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    post = Post(spot_id=spot_id, user_id=user.id, text=post_in.text, image_url=post_in.image_url)
    session.add(post)
    session.commit()
    session.refresh(post)
    return {"id": post.id}


@app.post("/posts/{post_id}/like")
def like_post(post_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    session.add(post)
    session.commit()
    return {"likes": post.likes}


@app.post("/posts/{post_id}/comment")
def comment_post(post_id: int, comment_in: CommentInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = Comment(post_id=post_id, user_id=user.id, text=comment_in.text)
    session.add(comment)
    session.commit()
    return {"status": "commented"}


@app.post("/uploads")
def upload_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as buffer:
        buffer.write(file.file.read())
    return {"url": f"/uploads/{filename}"}
