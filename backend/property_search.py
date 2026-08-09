"""
PropertySearch Module
Implements SQL keyword-based search and property ranking algorithms without external vector embeddings or ML libraries.
"""

import logging
from typing import Any, Dict, List, Optional
from property_database import PropertyDatabase

logger = logging.getLogger(__name__)


class PropertySearch:
    """Handles query keyword search and property ranking via SQL and scoring logic."""

    def __init__(self, db: PropertyDatabase) -> None:
        """
        Initialize PropertySearch with a PropertyDatabase instance.

        Args:
            db (PropertyDatabase): Database connection wrapper instance.
        """
        self.db = db

    def search(
        self, query: str = "", filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search and rank properties based on query keywords and filter match bonuses.

        Args:
            query (str): Search text phrase or space-separated keywords.
            filters (Optional[Dict[str, Any]]): Filters dict containing optional keys:
                min_price, max_price, min_beds, min_baths, location.

        Returns:
            List[Dict[str, Any]]: Top 20 ranked property dictionaries with search_score.
        """
        filters = filters or {}
        all_properties = self.db.get_all_properties()

        keywords = [k.strip().lower() for k in query.split() if len(k.strip()) > 0]

        scored_properties = []

        for prop in all_properties:
            score = 0.0
            address = prop.get("address", "").lower()
            description = prop.get("description", "").lower()
            amenities = prop.get("amenities", "").lower()
            location = prop.get("location", "").lower()

            # 1. Keyword search scoring: Address (weight 3), Description (weight 1)
            for kw in keywords:
                if kw in address:
                    score += 3.0
                if kw in description:
                    score += 1.0
                if kw in amenities:
                    score += 1.0
                if kw in location:
                    score += 2.0

            # 2. Filter criteria evaluation & exact match bonus (+2 per matched filter)
            matches_hard_filters = True
            filter_bonus = 0

            # Price filter
            if "min_price" in filters and filters["min_price"] is not None:
                if prop["price"] >= float(filters["min_price"]):
                    filter_bonus += 2
                else:
                    matches_hard_filters = False

            if "max_price" in filters and filters["max_price"] is not None:
                if prop["price"] <= float(filters["max_price"]):
                    filter_bonus += 2
                else:
                    matches_hard_filters = False

            # Beds filter
            if "min_beds" in filters and filters["min_beds"] is not None:
                if prop["beds"] >= int(filters["min_beds"]):
                    filter_bonus += 2
                else:
                    matches_hard_filters = False

            # Baths filter
            if "min_baths" in filters and filters["min_baths"] is not None:
                if prop["baths"] >= float(filters["min_baths"]):
                    filter_bonus += 2
                else:
                    matches_hard_filters = False

            # Location filter
            if "location" in filters and filters["location"]:
                loc_filter = str(filters["location"]).strip().lower()
                if location == loc_filter:
                    filter_bonus += 2
                else:
                    matches_hard_filters = False

            # If hard filters were set and failed, skip unless keywords override or include all
            if not matches_hard_filters and (
                "min_price" in filters
                or "max_price" in filters
                or "min_beds" in filters
                or "location" in filters
            ):
                continue

            total_score = score + filter_bonus

            # If a query was provided, only include properties with non-zero relevance score
            if keywords and score == 0 and filter_bonus == 0:
                continue

            prop_copy = dict(prop)
            prop_copy["search_score"] = round(total_score, 2)
            scored_properties.append(prop_copy)

        # Sort properties descending by search_score, then price ascending
        scored_properties.sort(
            key=lambda x: (x.get("search_score", 0), -x.get("price", 0)), reverse=True
        )

        return scored_properties[:20]
