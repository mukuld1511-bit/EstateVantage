"""
PropertyMatcher Module
Ranks real estate properties against buyer client profiles using deterministic preference scoring formulas.
"""

import logging
from typing import Any, Dict, List
from property_database import PropertyDatabase

logger = logging.getLogger(__name__)


class PropertyMatcher:
    """Matches properties to client buyer profiles based on defined scoring metrics."""

    def __init__(self, db: PropertyDatabase) -> None:
        """
        Initialize PropertyMatcher with a PropertyDatabase instance.

        Args:
            db (PropertyDatabase): Database wrapper instance.
        """
        self.db = db

    def match(self, client_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Match and rank properties for a given client profile.

        Client profile expected structure:
        {
            "budget": float,
            "min_beds": int,
            "min_baths": float,
            "preferred_location": str,
            "amenities": list[str] or comma-separated str
        }

        Scoring formula implementation:
        - price_score = max(0, 100 - abs(price - budget) / budget * 100)
        - +50 if property.beds >= client.min_beds
        - +50 if property.baths >= client.min_baths
        - +100 if property.location == preferred_location
        - +10 per matching amenity

        Returns:
            List[Dict[str, Any]]: Properties sorted descending by total_score.
        """
        budget = float(client_profile.get("budget", 1000000))
        min_beds = int(client_profile.get("min_beds", 1))
        min_baths = float(client_profile.get("min_baths", 1.0))
        preferred_loc = str(client_profile.get("preferred_location", "")).strip().lower()

        raw_amenities = client_profile.get("amenities", [])
        if isinstance(raw_amenities, str):
            client_amenities = [a.strip().lower() for a in raw_amenities.split(",") if a.strip()]
        else:
            client_amenities = [str(a).strip().lower() for a in raw_amenities if str(a).strip()]

        all_properties = self.db.get_all_properties()
        results: List[Dict[str, Any]] = []

        for prop in all_properties:
            price = float(prop.get("price", 0))
            beds = int(prop.get("beds", 0))
            baths = float(prop.get("baths", 0))
            location = str(prop.get("location", "")).strip().lower()
            prop_amenities_raw = str(prop.get("amenities", ""))
            prop_amenities = [a.strip().lower() for a in prop_amenities_raw.split(",") if a.strip()]

            # 1. Price Score formula
            if budget > 0:
                price_score = max(0.0, 100.0 - (abs(price - budget) / budget) * 100.0)
            else:
                price_score = 0.0

            # 2. Bedrooms Score (+50 if property.beds >= client.min_beds)
            beds_score = 50.0 if beds >= min_beds else 0.0

            # 3. Bathrooms Score (+50 if property.baths >= client.min_baths)
            baths_score = 50.0 if baths >= min_baths else 0.0

            # 4. Location Score (+100 if property.location == preferred_location)
            location_score = 100.0 if (preferred_loc and location == preferred_loc) else 0.0

            # 5. Amenities Score (+10 per matching amenity)
            matching_amenities = []
            amenity_score = 0.0
            for client_amenity in client_amenities:
                for pa in prop_amenities:
                    if client_amenity in pa or pa in client_amenity:
                        amenity_score += 10.0
                        matching_amenities.append(pa)
                        break

            total_score = price_score + beds_score + baths_score + location_score + amenity_score

            prop_result = dict(prop)
            prop_result["match_score"] = round(total_score, 1)
            prop_result["score_breakdown"] = {
                "price_score": round(price_score, 1),
                "beds_score": beds_score,
                "baths_score": baths_score,
                "location_score": location_score,
                "amenity_score": amenity_score,
                "matching_amenities": matching_amenities,
            }
            results.append(prop_result)

        # Sort descending by match_score
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results
