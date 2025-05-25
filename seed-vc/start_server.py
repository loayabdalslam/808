#!/usr/bin/env python3
"""
Simple script to start the FastAPI server
"""
import uvicorn
from api import app

if __name__ == "__main__":
    print("Starting Voice API server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
