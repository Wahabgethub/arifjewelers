"""End-to-end backend tests for Arif Jewellers API.

Runs against REACT_APP_BACKEND_URL (public preview URL).
"""

import io
import os
import pytest
import requests
from pathlib import Path

# ---- Load env from frontend/.env for REACT_APP_BACKEND_URL ----
def _load_env():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.strip() and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"'))

_load_env()

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "aw0329614@gmail.com"
ADMIN_PASSWORD = "wahab@123"


# ---- Fixtures ----
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0
    return data["token"]


@pytest.fixture(scope="session")
def admin_session(api_client, admin_token):
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


# ---- Health ----
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"


# ---- Auth ----
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"].lower() == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert "token" in d
        # cookie should be set
        cookies = r.cookies
        assert "access_token" in cookies

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"})
        assert r.status_code == 401

    def test_me_requires_auth(self, api_client):
        # Fresh session without auth
        s = requests.Session()
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, admin_token):
        s = requests.Session()
        r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        d = r.json()
        assert d["email"].lower() == ADMIN_EMAIL
        assert d["role"] == "admin"


# ---- Categories ----
class TestCategories:
    def test_list_categories(self, api_client):
        r = api_client.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) == 10
        # First should be necklaces (order preserved)
        assert cats[0]["slug"] == "necklaces"
        assert cats[-1]["slug"] == "artificial"
        for c in cats:
            assert "slug" in c and "name_en" in c and "name_ur" in c and "name_sd" in c


# ---- Products ----
class TestProducts:
    created_id = None

    def test_write_requires_auth(self, api_client):
        s = requests.Session()
        r = s.post(f"{API}/products", json={"name": "x", "category": "rings"})
        assert r.status_code == 401

    def test_create_and_get(self, admin_session):
        payload = {
            "name": "TEST_Ring_22K",
            "category": "rings",
            "weight": "5g",
            "purity": "22K",
            "featured": True,
            "new_arrival": True,
            "images": [],
        }
        r = admin_session.post(f"{API}/products", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["category"] == "rings"
        assert d["featured"] is True
        assert "id" in d
        TestProducts.created_id = d["id"]

        # verify persistence
        r2 = admin_session.get(f"{API}/products/{d['id']}")
        assert r2.status_code == 200
        assert r2.json()["name"] == payload["name"]

    def test_list_filters(self, admin_session):
        assert TestProducts.created_id is not None
        r = admin_session.get(f"{API}/products", params={"category": "rings"})
        assert r.status_code == 200
        assert any(p["id"] == TestProducts.created_id for p in r.json())

        r2 = admin_session.get(f"{API}/products", params={"featured": "true"})
        assert r2.status_code == 200
        assert any(p["id"] == TestProducts.created_id for p in r2.json())

        r3 = admin_session.get(f"{API}/products", params={"new_arrival": "true"})
        assert r3.status_code == 200
        assert any(p["id"] == TestProducts.created_id for p in r3.json())

    def test_update(self, admin_session):
        pid = TestProducts.created_id
        payload = {
            "name": "TEST_Ring_22K_UPDATED",
            "category": "rings",
            "weight": "6g",
            "purity": "22K",
            "featured": False,
            "new_arrival": False,
            "images": [],
        }
        r = admin_session.put(f"{API}/products/{pid}", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["featured"] is False

    def test_delete(self, admin_session):
        pid = TestProducts.created_id
        r = admin_session.delete(f"{API}/products/{pid}")
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/products/{pid}")
        assert r2.status_code == 404


# ---- Rates ----
class TestRates:
    def test_public_list(self, api_client):
        r = api_client.get(f"{API}/rates")
        assert r.status_code == 200
        data = r.json()
        cities = {d["city"] for d in data}
        assert {"Shahdadpur", "Hyderabad", "Karachi"}.issubset(cities)
        for city_doc in data:
            assert "rates" in city_doc and "updated_at" in city_doc
            karats = {r["karat"] for r in city_doc["rates"]}
            assert {"24K", "22K", "21K", "Silver"}.issubset(karats)

    def test_put_requires_auth(self, api_client):
        s = requests.Session()
        r = s.put(f"{API}/rates", json={"city": "Karachi", "rates": []})
        assert r.status_code == 401

    def test_put_upsert(self, admin_session):
        payload = {
            "city": "TEST_City",
            "rates": [
                {"karat": "24K", "price_per_tola": 290000, "price_per_gram": 24870},
                {"karat": "22K", "price_per_tola": 265833, "price_per_gram": 22797},
                {"karat": "21K", "price_per_tola": 253750, "price_per_gram": 21761},
                {"karat": "Silver", "price_per_tola": 3500, "price_per_gram": 300},
            ],
        }
        r = admin_session.put(f"{API}/rates", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["city"] == "TEST_City"
        assert len(d["rates"]) == 4
        # cleanup
        r2 = admin_session.delete(f"{API}/rates/TEST_City")
        assert r2.status_code == 200

    def test_api_suggestion_auth_gated(self, api_client):
        s = requests.Session()
        r = s.get(f"{API}/rates/api-suggestion")
        assert r.status_code == 401

    def test_api_suggestion(self, admin_session):
        r = admin_session.get(f"{API}/rates/api-suggestion")
        # External dependency: goldprice.org. Allow 502 as pass.
        if r.status_code == 502:
            pytest.skip("External goldprice.org is down (502) — auth-gating verified above")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "suggested" in d and isinstance(d["suggested"], list)
        assert len(d["suggested"]) == 4
        karats = {s["karat"] for s in d["suggested"]}
        assert karats == {"24K", "22K", "21K", "Silver"}
        for item in d["suggested"]:
            assert item["price_per_gram"] > 0
            assert item["price_per_tola"] > 0


# ---- Inquiries ----
class TestInquiries:
    created_id = None

    def test_public_create(self, api_client):
        payload = {
            "name": "TEST_Ali",
            "phone": "03001234567",
            "message": "TEST_message for inquiry",
            "product_name": "TEST_Ring_22K",
        }
        s = requests.Session()  # unauth
        r = s.post(f"{API}/inquiries", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        assert d["whatsapp_url"].startswith("https://wa.me/92")
        TestInquiries.created_id = d["id"]

    def test_list_requires_auth(self, api_client):
        s = requests.Session()
        r = s.get(f"{API}/inquiries")
        assert r.status_code == 401

    def test_list_admin(self, admin_session):
        r = admin_session.get(f"{API}/inquiries")
        assert r.status_code == 200
        docs = r.json()
        assert any(d["id"] == TestInquiries.created_id for d in docs)

    def test_delete_cleanup(self, admin_session):
        r = admin_session.delete(f"{API}/inquiries/{TestInquiries.created_id}")
        assert r.status_code == 200


# ---- Reviews ----
class TestReviews:
    created_id = None

    def test_write_requires_auth(self, api_client):
        s = requests.Session()
        r = s.post(f"{API}/reviews", json={"customer_name": "x", "rating": 5, "text": "y"})
        assert r.status_code == 401

    def test_create_admin(self, admin_session):
        payload = {"customer_name": "TEST_Reviewer", "rating": 5, "text": "TEST_Great service"}
        r = admin_session.post(f"{API}/reviews", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["customer_name"] == payload["customer_name"]
        assert d["rating"] == 5
        TestReviews.created_id = d["id"]

    def test_public_list(self, api_client):
        r = api_client.get(f"{API}/reviews")
        assert r.status_code == 200
        docs = r.json()
        assert any(d["id"] == TestReviews.created_id for d in docs)

    def test_delete_cleanup(self, admin_session):
        r = admin_session.delete(f"{API}/reviews/{TestReviews.created_id}")
        assert r.status_code == 200


# ---- Files ----
class TestFiles:
    def test_upload_requires_auth(self, api_client):
        s = requests.Session()
        r = s.post(f"{API}/files/upload", files={"file": ("t.png", b"\x89PNG\r\n\x1a\n", "image/png")})
        assert r.status_code == 401

    def test_upload_and_download(self, admin_token):
        # Minimal valid 1x1 PNG (generated fresh)
        import struct, zlib
        def _png_1x1():
            sig = b"\x89PNG\r\n\x1a\n"
            def chunk(t, d):
                return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
            ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)  # 1x1 RGB
            idat = zlib.compress(b"\x00\xff\x00\x00")  # filter byte + 1 pixel RGB
            return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
        png_bytes = _png_1x1()
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {admin_token}"})
        # do not set Content-Type here — requests will set multipart
        r = s.post(f"{API}/files/upload", files={"file": ("t.png", png_bytes, "image/png")})
        if r.status_code == 500:
            pytest.skip(f"Object storage unavailable: {r.text[:200]}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and "url" in d
        assert d["url"].startswith("/api/files/")

        # download
        file_id = d["id"]
        r2 = requests.get(f"{API}/files/{file_id}")
        if r2.status_code == 500:
            pytest.skip("Storage read failed (external down)")
        assert r2.status_code == 200
        assert r2.headers["content-type"].startswith("image/")
        assert len(r2.content) > 0
