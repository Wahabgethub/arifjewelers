from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Query, Header
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response as StarletteResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------- Config / Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("arif")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "").lower().strip()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "arif-jewellers")
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "03092276875")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Arif Jewellers API")
api = APIRouter(prefix="/api")

# ---------- Object Storage (Cloudinary) ----------
import cloudinary
import cloudinary.uploader

CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

def init_storage():
    if not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
        raise RuntimeError("Cloudinary credentials are not set")
    return True

def put_object(path: str, data: bytes, content_type: str):
    result = cloudinary.uploader.upload(
        data,
        public_id=path,
        resource_type="image",
    )
    return {"path": result["public_id"], "url": result["secure_url"], "size": result.get("bytes", len(data))}


# ---------- Auth Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    category: str  # slug
    weight: Optional[str] = None
    purity: Optional[str] = None
    making_charges: Optional[str] = None
    availability: Optional[str] = "In Stock"
    description: Optional[str] = None
    images: List[str] = []  # file ids
    featured: bool = False
    new_arrival: bool = False

class RateItem(BaseModel):
    karat: str  # "24K" | "22K" | "21K" | "Silver"
    price_per_tola: float
    price_per_gram: Optional[float] = None

class CityRatesIn(BaseModel):
    city: str
    rates: List[RateItem]

class ReviewIn(BaseModel):
    customer_name: str
    rating: int = Field(ge=1, le=5)
    text: str
    photo: Optional[str] = None  # file id

class InquiryIn(BaseModel):
    name: str
    phone: str
    message: str
    product_name: Optional[str] = None


# ---------- Seed & Defaults ----------
DEFAULT_CATEGORIES = [
    {"slug": "necklaces", "name_en": "Necklaces", "name_ur": "ہار", "name_sd": "هار"},
    {"slug": "rings", "name_en": "Rings", "name_ur": "انگوٹھیاں", "name_sd": "منڊيون"},
    {"slug": "bangles", "name_en": "Bangles", "name_ur": "چوڑیاں", "name_sd": "چوڙيون"},
    {"slug": "earrings", "name_en": "Earrings", "name_ur": "بالیاں", "name_sd": "والا"},
    {"slug": "chains", "name_en": "Chains", "name_ur": "زنجیریں", "name_sd": "زنجيرون"},
    {"slug": "pendants", "name_en": "Pendants", "name_ur": "لاکٹ", "name_sd": "لاڪيٽ"},
    {"slug": "bridal", "name_en": "Bridal Collection", "name_ur": "دلہن کلیکشن", "name_sd": "ڪنوار سيٽ"},
    {"slug": "gold-bars", "name_en": "24K Gold Bars & Biscuits", "name_ur": "24 قیراط سونے کے بسکٹ", "name_sd": "24 قيراط سون بسڪٽ"},
    {"slug": "silver-bars", "name_en": "Silver Bars & Biscuits", "name_ur": "چاندی کی بسکٹ", "name_sd": "چانديءَ جا بسڪٽ"},
    {"slug": "artificial", "name_en": "Artificial Jewelry", "name_ur": "مصنوعی زیورات", "name_sd": "مصنوعي زيور"},
]

DEFAULT_CITIES = ["Shahdadpur", "Hyderabad", "Karachi"]

async def seed_defaults():
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.rates.create_index("city", unique=True)

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "name": "Admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    else:
        # keep password in sync with .env
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
            logger.info("Updated admin password hash")

    # Seed categories
    for cat in DEFAULT_CATEGORIES:
        await db.categories.update_one({"slug": cat["slug"]}, {"$setOnInsert": cat}, upsert=True)

    # Seed default rates per city (empty rates but with city entries)
    default_rates_seed = [
        {"karat": "24K", "price_per_tola": 285000, "price_per_gram": 24435},
        {"karat": "22K", "price_per_tola": 261250, "price_per_gram": 22400},
        {"karat": "21K", "price_per_tola": 249375, "price_per_gram": 21380},
        {"karat": "Silver", "price_per_tola": 3450, "price_per_gram": 296},
    ]
    for city in DEFAULT_CITIES:
        existing_city = await db.rates.find_one({"city": city})
        if not existing_city:
            await db.rates.insert_one({
                "city": city,
                "rates": default_rates_seed,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

    # Write test credentials for testing agent
    try:
        mem_dir = Path("/app/memory")
        mem_dir.mkdir(parents=True, exist_ok=True)
        (mem_dir / "test_credentials.md").write_text(
            f"# Test Credentials\n\n## Admin (Arif Jewellers)\n- Email: {ADMIN_EMAIL}\n- Password: {ADMIN_PASSWORD}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET  /api/auth/me\n"
        )
    except Exception as e:
        logger.warning(f"Could not write test_credentials.md: {e}")


@app.on_event("startup")
async def on_startup():
    await seed_defaults()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init deferred: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- Auth Endpoints ----------
@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=12 * 3600, path="/",
    )
    return {
        "id": user["id"], "email": user["email"], "role": user.get("role", "admin"),
        "name": user.get("name", "Admin"), "token": token,
    }

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user=Depends(get_current_admin)):
    return user


# ---------- Categories ----------
@api.get("/categories")
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).to_list(100)
    order = {c["slug"]: i for i, c in enumerate(DEFAULT_CATEGORIES)}
    docs.sort(key=lambda d: order.get(d["slug"], 999))
    return docs


# ---------- Products ----------
def _product_doc(doc):
    doc.pop("_id", None)
    return doc

@api.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, new_arrival: Optional[bool] = None):
    q = {}
    if category:
        q["category"] = category
    if featured is not None:
        q["featured"] = featured
    if new_arrival is not None:
        q["new_arrival"] = new_arrival
    docs = await db.products.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api.get("/products/{pid}")
async def get_product(pid: str):
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc

@api.post("/products")
async def create_product(payload: ProductIn, user=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/products/{pid}")
async def update_product(pid: str, payload: ProductIn, user=Depends(get_current_admin)):
    update = payload.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.products.update_one({"id": pid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    return doc

@api.delete("/products/{pid}")
async def delete_product(pid: str, user=Depends(get_current_admin)):
    res = await db.products.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ---------- Rates ----------
@api.get("/rates")
async def get_rates():
    docs = await db.rates.find({}, {"_id": 0}).to_list(100)
    return docs

@api.put("/rates")
async def update_rates(payload: CityRatesIn, user=Depends(get_current_admin)):
    now = datetime.now(timezone.utc).isoformat()
    await db.rates.update_one(
        {"city": payload.city},
        {"$set": {
            "city": payload.city,
            "rates": [r.model_dump() for r in payload.rates],
            "updated_at": now,
        }},
        upsert=True,
    )
    doc = await db.rates.find_one({"city": payload.city}, {"_id": 0})
    return doc

@api.delete("/rates/{city}")
async def delete_city_rate(city: str, user=Depends(get_current_admin)):
    await db.rates.delete_one({"city": city})
    return {"ok": True}

@api.get("/rates/api-suggestion")
async def rates_api_suggestion(user=Depends(get_current_admin)):
    """Fetches live gold/silver spot from public source and converts to PKR/tola.
    Uses data-asg.goldprice.org (no key required). USD->PKR conversion via open.er-api.com."""
    try:
        gp = requests.get("https://data-asg.goldprice.org/dbXRates/USD", timeout=15).json()
        item = gp["items"][0]
        xau_usd_oz = float(item["xauPrice"])  # gold USD per troy ounce
        xag_usd_oz = float(item["xagPrice"])  # silver USD per troy ounce
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch gold spot: {e}")
    try:
        fx = requests.get("https://open.er-api.com/v6/latest/USD", timeout=15).json()
        usd_pkr = float(fx["rates"]["PKR"])
    except Exception:
        usd_pkr = 278.0  # fallback approx
    # Conversions
    oz_to_gram = 31.1034768
    gram_to_tola = 11.664
    gold_pkr_per_gram_24k = (xau_usd_oz * usd_pkr) / oz_to_gram
    silver_pkr_per_gram = (xag_usd_oz * usd_pkr) / oz_to_gram

    def build(karat_factor):
        gram = round(gold_pkr_per_gram_24k * karat_factor, 2)
        tola = round(gram * gram_to_tola, 2)
        return gram, tola

    g24_g, g24_t = build(1.0)
    g22_g, g22_t = build(22.0 / 24.0)
    g21_g, g21_t = build(21.0 / 24.0)
    sil_g = round(silver_pkr_per_gram, 2)
    sil_t = round(sil_g * gram_to_tola, 2)

    return {
        "source": "data-asg.goldprice.org",
        "usd_pkr": round(usd_pkr, 2),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "suggested": [
            {"karat": "24K", "price_per_gram": g24_g, "price_per_tola": g24_t},
            {"karat": "22K", "price_per_gram": g22_g, "price_per_tola": g22_t},
            {"karat": "21K", "price_per_gram": g21_g, "price_per_tola": g21_t},
            {"karat": "Silver", "price_per_gram": sil_g, "price_per_tola": sil_t},
        ],
    }


# ---------- Reviews ----------
@api.get("/reviews")
async def list_reviews():
    docs = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api.post("/reviews")
async def create_review(payload: ReviewIn, user=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.delete("/reviews/{rid}")
async def delete_review(rid: str, user=Depends(get_current_admin)):
    await db.reviews.delete_one({"id": rid})
    return {"ok": True}


# ---------- Inquiries ----------
def _clean_phone(raw: str) -> str:
    digits = "".join(ch for ch in raw if ch.isdigit())
    if digits.startswith("0"):
        digits = "92" + digits[1:]
    return digits

@api.post("/inquiries")
async def create_inquiry(payload: InquiryIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)
    wa_num = _clean_phone(WHATSAPP_NUMBER)
    msg = f"Assalam-o-Alaikum, mera naam {payload.name} hai.\n"
    if payload.product_name:
        msg += f"Product: {payload.product_name}\n"
    msg += f"Phone: {payload.phone}\n\n{payload.message}"
    import urllib.parse
    wa_link = f"https://wa.me/{wa_num}?text={urllib.parse.quote(msg)}"
    return {"id": doc["id"], "whatsapp_url": wa_link}

@api.get("/inquiries")
async def list_inquiries(user=Depends(get_current_admin)):
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api.delete("/inquiries/{iid}")
async def delete_inquiry(iid: str, user=Depends(get_current_admin)):
    await db.inquiries.delete_one({"id": iid})
    return {"ok": True}


# ---------- File Upload / Download ----------
MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif"}

@api.post("/files/upload")
async def upload_file(file: UploadFile = File(...), user=Depends(get_current_admin)):
    ext = (file.filename or "bin").rsplit(".", 1)[-1].lower()
    content_type = MIME.get(ext, file.content_type or "application/octet-stream")
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{file_id}"
    data = await file.read()
    result = put_object(path, data, content_type)
    doc = {
        "id": file_id,
        "storage_path": result["path"],
        "cloud_url": result["url"],
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "original_filename": file.filename,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(doc)
    return {"id": file_id, "url": f"/api/files/{file_id}"}

@api.get("/files/{file_id}")
async def download_file(file_id: str):
    rec = await db.files.find_one({"id": file_id, "is_deleted": False})
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    if rec.get("cloud_url"):
        return RedirectResponse(rec["cloud_url"])
    raise HTTPException(status_code=500, detail="Storage read error")


# ---------- Health ----------
@api.get("/")
async def root():
    return {"app": "Arif Jewellers", "status": "ok", "whatsapp": WHATSAPP_NUMBER}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
