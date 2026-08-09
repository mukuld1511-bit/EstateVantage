import os
import json
import logging
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# New google-genai SDK
from google import genai
from google.genai import types

load_dotenv()
logger = logging.getLogger("chat_service")

API_KEY = os.getenv("GEMINI_API_KEY")

class ChatService:
    def __init__(self, property_search_service):
        self.search_service = property_search_service
        if API_KEY and API_KEY != "your_api_key_here":
            self.client = genai.Client(api_key=API_KEY)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY is not set or is still the default template value.")

    def _extract_intent(self, message: str) -> Dict[str, Any]:
        """
        Uses Gemini to extract search parameters from a natural language query.
        Returns a dictionary matching the SearchFilters schema.
        """
        if not self.client:
            raise Exception("Gemini API key is missing. Please add it to backend/.env")

        prompt = f"""
        You are a real estate intent extraction assistant. 
        Extract the property search requirements from the user's message.
        Respond ONLY with a valid JSON object matching the schema below. If a requirement is not mentioned, omit it or set to null.
        
        Schema:
        {{
            "min_price": number (optional),
            "max_price": number (optional),
            "min_beds": number (optional),
            "min_baths": number (optional),
            "location": string (optional, e.g. "Downtown", "Suburbs", "Waterfront", "Tech Corridor"),
            "query": string (optional, generic keywords or amenities like "pool", "balcony")
        }}
        
        User Message: "{message}"
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=prompt
            )
            content = response.text.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            intent = json.loads(content.strip())
            return intent
        except Exception as e:
            logger.error(f"Failed to extract intent with Gemini: {e}")
            return {}

    def chat(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        End-to-end RAG flow:
        1. Extract intent
        2. Search local DB
        3. Generate conversational response
        """
        if not self.client:
            return "Please configure your Gemini API key in the backend/.env file and restart the backend.", []

        # Step 1: Extract intent
        intent = self._extract_intent(user_message)
        logger.info(f"Extracted Intent: {intent}")

        # Step 2: Search local DB
        query = intent.pop("query", "")
        filters = {k: v for k, v in intent.items() if v is not None}
        
        search_results = self.search_service.search(query=query, filters=filters)
        top_properties = search_results[:3]

        # Step 3: Generate conversational response
        prompt = f"""
        You are 'The Realtor *', a helpful and professional real estate agent chatbot.
        The user just said: "{user_message}"
        
        I ran a search based on their request and found {len(search_results)} matching properties.
        Here are the top matches:
        {json.dumps(top_properties, indent=2)}

        Write a natural, conversational response to the user.
        - Be friendly and professional.
        - Summarize the best matches.
        - If no properties were found, politely let them know.
        - Do not include raw JSON or database IDs in your response. Keep it conversational.
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=prompt
            )
            return response.text, top_properties
        except Exception as e:
            logger.error(f"Failed to generate chat response: {e}")
            return "I encountered an error trying to generate a response. Here are the properties I found:", top_properties

    def generate_market_insight(self, properties: List[Dict[str, Any]]) -> str:
        """
        Uses Gemini to generate a short, professional market insight based on a list of properties.
        """
        if not self.client:
            return "AI Market Insights are disabled. Please configure your Gemini API key."
            
        if not properties:
            return "No properties found in the current search to analyze."

        # Truncate to top 10 to avoid token limits on large queries
        sample = properties[:10]
        
        prompt = f"""
        You are an expert Real Estate Market Analyst.
        Analyze the following subset of properties that a user just searched for.
        
        Properties:
        {json.dumps(sample, indent=2)}
        
        Provide a concise, 2-3 sentence market insight.
        Identify trends such as average pricing, dominant property types, or notable locations.
        Keep the tone professional, objective, and highly data-driven. Do not say "Based on the data provided...".
        Just dive straight into the insight.
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate market insight: {e}")
            return "Unable to generate market insights at this time."
