"""
CORS Middleware Configuration for IPDC-OSS API
Allows frontend (React) to communicate with backend (FastAPI)
"""
from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app):
    """
    Configure CORS middleware for the FastAPI app
    Allows requests from React frontend running on localhost:5173
    """
    origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Alternate port
        "http://localhost:5175",  # Alternate port
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
    )

    return app
