from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from app.database.database import engine, Base
from app.routes import auth, upload, analysis, navigation, reports, health, simulation, chat

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LunaSafe AI Backend API",
    description="Backend for AI-powered lunar terrain analysis and rover navigation.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("app/uploads", exist_ok=True)
os.makedirs("app/results", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")
app.mount("/results", StaticFiles(directory="app/results"), name="results")

from fastapi.exceptions import HTTPException
import logging
from app.utils.exceptions import ProcessingError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Exception handlers for standard response format
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    step = getattr(exc, "step", "Unknown Error")
    error_msg = str(exc)
    logger.error(f"Failed at step '{step}': {error_msg}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": error_msg, "step": step},
    )

@app.exception_handler(ProcessingError)
async def processing_exception_handler(request: Request, exc: ProcessingError):
    logger.error(f"Failed at step '{exc.step}': {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"success": False, "error": str(exc), "step": exc.step},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    step = getattr(exc, "step", "API Request")
    logger.error(f"Failed at step '{step}': {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail, "step": step},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation failed: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": "Validation Error", "step": "API Validation", "data": {"errors": exc.errors()}},
    )

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(navigation.router)
app.include_router(reports.router)
app.include_router(simulation.router)
app.include_router(chat.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
