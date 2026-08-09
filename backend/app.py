"""
FastAPI Backend Application
Provides RESTful APIs for Property Search, Client Matching, Market Intelligence,
Investment ROI Calculations, Report Generation, and Favorites Management.
"""

import logging
import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from property_database import PropertyDatabase
from property_search import PropertySearch
from property_matcher import PropertyMatcher
from chat_service import ChatService

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("RealEstateAPI")

app = FastAPI(
    title="Real Estate Agent RAG API",
    description="SQL-based Real Estate RAG & Analytics Backend without ML/LLM dependencies.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core services
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PROPERTIES_CSV = os.path.join(DATA_DIR, "properties.csv")
NEIGHBORHOODS_CSV = os.path.join(DATA_DIR, "neighborhoods.csv")

db = PropertyDatabase("real_estate.db")
db.load_properties(PROPERTIES_CSV)

search_service = PropertySearch(db)
matcher_service = PropertyMatcher(db)
chat_service = ChatService(search_service)

# In-memory favorites storage for demo purposes
favorites_db: List[Dict[str, Any]] = []


# --- Pydantic Schemas ---

class SearchRequest(BaseModel):
    query: Optional[str] = ""
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ClientProfileRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Client max budget in USD")
    min_beds: int = Field(1, ge=0)
    min_baths: float = Field(1.0, ge=0)
    preferred_location: str = ""
    amenities: Optional[List[str]] = Field(default_factory=list)


class FavoriteRequest(BaseModel):
    user_id: int = 1
    property_id: int

class ChatRequest(BaseModel):
    message: str


# --- API Routes ---

@app.get("/health", tags=["Health"])
def health_check():
    """Health check route."""
    logger.info("Health check endpoint pinged.")
    return {"status": "ok", "database_status": "connected"}


@app.post("/api/search", tags=["Properties"])
def search_properties(req: SearchRequest):
    """
    Search properties using keyword matching and filter evaluation.
    """
    try:
        logger.info(f"Search request: query='{req.query}', filters={req.filters}")
        results = search_service.search(query=req.query or "", filters=req.filters or {})
        return {"count": len(results), "results": results}
    except Exception as e:
        logger.error(f"Error in property search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/property/{id}", tags=["Properties"])
def get_property_by_id(id: int):
    """
    Get detailed property information by ID.
    """
    try:
        logger.info(f"Fetching property ID: {id}")
        prop = db.get_property(id)
        if not prop:
            raise HTTPException(status_code=404, detail=f"Property ID {id} not found.")

        return {"property": prop}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching property {id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/match", tags=["Client Matcher"])
def match_client_profile(profile: ClientProfileRequest):
    """
    Match properties to client criteria and return ranked results.
    """
    try:
        logger.info(f"Client matching request: budget=${profile.budget}, loc={profile.preferred_location}")
        profile_dict = profile.dict()
        results = matcher_service.match(profile_dict)
        return {"count": len(results), "matches": results}
    except Exception as e:
        logger.error(f"Error matching client profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/favorites", tags=["Favorites"])
def add_favorite(fav: FavoriteRequest):
    """
    Add property to user's favorites list.
    """
    try:
        logger.info(f"Adding property {fav.property_id} to user {fav.user_id} favorites")
        success = db.add_favorite(fav.user_id, fav.property_id)
        if not success:
            return {"message": "Failed to add favorite", "favorite": {}}
        return {"message": "Property saved to favorites", "favorite": {"user_id": fav.user_id, "property_id": fav.property_id}}
    except Exception as e:
        logger.error(f"Error adding favorite: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", tags=["Generative RAG"])
def chat_with_agent(req: ChatRequest):
    """
    True RAG endpoint: extracts intent using Gemini, searches DB, generates response.
    """
    try:
        response_text, properties = chat_service.chat(req.message)
        return {"response": response_text, "properties": properties}
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class MarketInsightRequest(BaseModel):
    query: Optional[str] = ""
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)

@app.post("/api/market-insight", tags=["Generative RAG"])
def get_market_insight(req: MarketInsightRequest):
    """
    Generates a dynamic market insight based on the current search results.
    """
    try:
        logger.info(f"Generating market insight for query='{req.query}'")
        # 1. Fetch the exact properties the user is looking at
        results = search_service.search(query=req.query or "", filters=req.filters or {})
        
        # 2. Feed them to Gemini to generate the insight
        insight = chat_service.generate_market_insight(results)
        
        return {"insight": insight}
    except Exception as e:
        logger.error(f"Error generating market insight: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/favorites", tags=["Favorites"])
def get_user_favorites(user_id: int = 1):
    """
    Get all favorite properties for a user.
    """
    try:
        logger.info(f"Fetching favorites for user {user_id}")
        user_fav_ids = db.get_favorites(user_id)
        fav_properties = [db.get_property(pid) for pid in user_fav_ids if db.get_property(pid)]
        return {"count": len(fav_properties), "favorites": fav_properties}
    except Exception as e:
        logger.error(f"Error fetching favorites: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
