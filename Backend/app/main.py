from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers.auth import router as auth_router
from app.api.routers.documents import router as documents_router
from app.api.routers.query import router as query_router
from app.core.config import settings
from app.api.routers.user_profile import router as user_profile_router

app = FastAPI(
    title="Book Helper API",
    description="Backend API for the Book Helper application.",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

origins = settings.FRONTEND_URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allows specific traffic
    allow_credentials=True,          # Allows cookies and headers
    allow_methods=["*"],             # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allows all request headers
)


# Routers

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(query_router)
app.include_router(user_profile_router)


# Health check


@app.get("/")
def home():
    return {"message": "Welcome to the Book Helper API"}


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok"}
