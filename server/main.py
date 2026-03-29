from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from sqlmodel import Field, Session, SQLModel, create_engine, select

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("GORUNNERS_DB", f"sqlite:///{BASE_DIR / 'gorunners.db'}")
SECRET_KEY = os.getenv("GORUNNERS_SECRET", "change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
UPLOAD_DIR = os.getenv("GORUNNERS_UPLOADS", str(BASE_DIR / "uploads"))
PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390000

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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
    created_at: datetime = Field(default_factory=now_utc)


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


engine = create_engine(DATABASE_URL, echo=False)

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
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


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


def seed_data(session: Session) -> None:
    admin_email = os.getenv("GORUNNERS_ADMIN_EMAIL", "admin@gorunners.com")
    admin_password = os.getenv("GORUNNERS_ADMIN_PASSWORD", "gorunners123")
    existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
    if existing_admin:
        existing_admin.role = "admin"
        existing_admin.password_hash = hash_password(admin_password)
        session.add(existing_admin)
        session.commit()
    else:
        admin = User(email=admin_email, name="Admin", password_hash=hash_password(admin_password), role="admin")
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
    with Session(engine) as session:
        seed_data(session)


@app.get("/health")
def health():
    return {"status": "ok"}


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
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name, "role": current_user.role}


@app.get("/admin/users", dependencies=[Depends(require_admin)])
def list_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return [
        {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "created_at": user.created_at}
        for user in users
    ]


@app.put("/admin/users/{user_id}/role", dependencies=[Depends(require_admin)])
def update_user_role(user_id: int, role_in: RoleUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role_in.role not in {"admin", "user"}:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role_in.role
    session.add(user)
    session.commit()
    return {"status": "updated", "role": user.role}


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
    if event.spots_left > event.capacity:
        event.spots_left = event.capacity
    session.add(event)
    session.commit()
    return event_to_dict(event)


@app.delete("/events/{event_id}", dependencies=[Depends(require_admin)])
def delete_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
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
