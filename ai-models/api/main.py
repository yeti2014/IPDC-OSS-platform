"""
IPDC-OSS FastAPI Backend
Ethiopian Industrial Parks Development Corporation - One-Stop Service
AI-Powered Service Request Management System

Author: Claude Code
Date: January 11, 2026
Version: 1.0.0
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import time

# Import middleware
from api.middleware.cors import setup_cors

# Import models (Pydantic schemas)
from api.models import HealthCheckResponse, ErrorResponse

# Import model loader
from api.utils.model_loader import model_loader

# Import endpoint routers (will create these next)
from api.endpoints import service_classifier, maintenance, park_recommendation


# ==================== APP INITIALIZATION ====================

app = FastAPI(
    title="IPDC-OSS AI API",
    description="Ethiopian Industrial Parks Development Corporation - One-Stop Service AI-Powered API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Setup CORS
app = setup_cors(app)


# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    """
    Load all AI models when the server starts
    """
    print("\n" + "="*60)
    print("IPDC-OSS API Server Starting...")
    print("Ethiopian Industrial Parks Development Corporation")
    print("One-Stop Service Platform")
    print("="*60 + "\n")

    try:
        # Models are already loaded by ModelLoader singleton
        models = model_loader.get_all_models()
        print(f"Loaded {len(models)} AI models")
        print("\n" + "="*60)
        print("Server Ready!")
        print("API Documentation: http://localhost:8000/api/docs")
        print("Health Check: http://localhost:8000/api/health")
        print("="*60 + "\n")
    except Exception as e:
        print(f"Error during startup: {str(e)}")
        raise


# ==================== ROOT & HEALTH ENDPOINTS ====================

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "IPDC-OSS AI API",
        "version": "1.0.0",
        "description": "Ethiopian Industrial Parks Development Corporation - One-Stop Service",
        "documentation": "/api/docs",
        "health_check": "/api/health",
        "endpoints": {
            "service_classification": "/api/v1/classify-service",
            "maintenance_prediction": "/api/v1/predict-maintenance",
            "park_recommendation": "/api/v1/recommend-parks"
        }
    }


@app.get("/api/ping", tags=["Health"])
async def ping():
    """
    Lightweight keep-alive endpoint for cron job.
    Responds instantly without loading models.
    """
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint - verify all models are loaded
    """
    try:
        models = model_loader.get_all_models()
        models_loaded = {
            "model1_service_classifier": "model1" in models,
            "model2_predictive_maintenance": "model2" in models,
            "model3_park_recommendation": "model3" in models
        }

        all_loaded = all(models_loaded.values())

        return HealthCheckResponse(
            status="healthy" if all_loaded else "degraded",
            version="1.0.0",
            models_loaded=models_loaded,
            timestamp=datetime.now()
        )
    except Exception as e:
        return HealthCheckResponse(
            status="unhealthy",
            version="1.0.0",
            models_loaded={},
            timestamp=datetime.now()
        )


# ==================== INCLUDE ROUTERS ====================

# Include endpoint routers
app.include_router(
    service_classifier.router,
    prefix="/api/v1",
    tags=["Model 1: Service Classification"]
)

app.include_router(
    maintenance.router,
    prefix="/api/v1",
    tags=["Model 2: Predictive Maintenance"]
)

app.include_router(
    park_recommendation.router,
    prefix="/api/v1",
    tags=["Model 3: Park Recommendation"]
)


# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            error=exc.detail,
            timestamp=datetime.now()
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            success=False,
            error="Internal Server Error",
            details=str(exc),
            timestamp=datetime.now()
        ).dict()
    )


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
