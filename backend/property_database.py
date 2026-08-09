"""
PropertyDatabase Module
Manages SQLite persistence for real estate properties.
Loads property data from CSV and provides querying methods with database indexes.
"""

import csv
import logging
import os
import sqlite3
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class PropertyDatabase:
    """SQLite database manager for real estate properties."""

    def __init__(self, db_path: str = "real_estate.db") -> None:
        """
        Initialize the PropertyDatabase connection and create schema.

        Args:
            db_path (str): Path to SQLite database file or ':memory:'
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self) -> None:
        """Create tables and indexes if they do not exist."""
        try:
            with self.conn:
                self.conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS properties (
                        id INTEGER PRIMARY KEY,
                        address TEXT NOT NULL,
                        price REAL NOT NULL,
                        beds INTEGER NOT NULL,
                        baths REAL NOT NULL,
                        sqft INTEGER NOT NULL,
                        location TEXT NOT NULL,
                        amenities TEXT,
                        description TEXT
                    )
                """
                )
                # Create required indexes on address, price, beds, location
                self.conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address);"
                )
                self.conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);"
                )
                self.conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);"
                )
                self.conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);"
                )
                self.conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS favorites (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        property_id INTEGER NOT NULL,
                        UNIQUE(user_id, property_id)
                    )
                    """
                )
            logger.info("Database schema initialized with indexes.")
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    def load_properties(self, csv_path: str) -> int:
        """
        Loads property records from a CSV file into the database.

        Args:
            csv_path (str): File path to CSV containing property records.

        Returns:
            int: Number of properties loaded into database.
        """
        if not os.path.exists(csv_path):
            logger.warning(f"CSV file not found at {csv_path}")
            return 0

        loaded_count = 0
        try:
            with open(csv_path, mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                with self.conn:
                    for row in reader:
                        prop_id = int(row["id"]) if row.get("id") else None
                        address = row.get("address", "").strip()
                        price = float(row.get("price", 0))
                        beds = int(row.get("beds", 0))
                        baths = float(row.get("baths", 0))
                        sqft = int(row.get("sqft", 0))
                        location = row.get("location", "").strip()
                        amenities = row.get("amenities", "").strip()
                        description = row.get("description", "").strip()

                        if prop_id is not None:
                            self.conn.execute(
                                """
                                INSERT OR REPLACE INTO properties
                                (id, address, price, beds, baths, sqft, location, amenities, description)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                                (
                                    prop_id,
                                    address,
                                    price,
                                    beds,
                                    baths,
                                    sqft,
                                    location,
                                    amenities,
                                    description,
                                ),
                            )
                        else:
                            self.conn.execute(
                                """
                                INSERT INTO properties
                                (address, price, beds, baths, sqft, location, amenities, description)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                                (
                                    address,
                                    price,
                                    beds,
                                    baths,
                                    sqft,
                                    location,
                                    amenities,
                                    description,
                                ),
                            )
                        loaded_count += 1
            logger.info(f"Loaded {loaded_count} properties from {csv_path}")
            return loaded_count
        except (sqlite3.Error, ValueError, csv.Error) as e:
            logger.error(f"Error loading properties from CSV: {e}")
            raise

    def get_property(self, property_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single property by its ID.

        Args:
            property_id (int): Property ID

        Returns:
            Optional[Dict[str, Any]]: Property dictionary or None if not found
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        except sqlite3.Error as e:
            logger.error(f"Error fetching property ID {property_id}: {e}")
            return None

    def get_all_properties(
        self, filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve all properties optionally filtered by explicit criteria.

        Args:
            filters (Optional[Dict[str, Any]]): Filter keys like min_price, max_price,
                min_beds, min_baths, location, etc.

        Returns:
            List[Dict[str, Any]]: List of property dicts matching filters
        """
        query = "SELECT * FROM properties WHERE 1=1"
        params: List[Any] = []

        if filters:
            if "min_price" in filters and filters["min_price"] is not None:
                query += " AND price >= ?"
                params.append(filters["min_price"])
            if "max_price" in filters and filters["max_price"] is not None:
                query += " AND price <= ?"
                params.append(filters["max_price"])
            if "min_beds" in filters and filters["min_beds"] is not None:
                query += " AND beds >= ?"
                params.append(filters["min_beds"])
            if "min_baths" in filters and filters["min_baths"] is not None:
                query += " AND baths >= ?"
                params.append(filters["min_baths"])
            if "location" in filters and filters["location"]:
                query += " AND LOWER(location) = LOWER(?)"
                params.append(filters["location"].strip())

        try:
            cursor = self.conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except sqlite3.Error as e:
            logger.error(f"Error executing get_all_properties query: {e}")
            return []

    def add_property(self, data: Dict[str, Any]) -> int:
        """
        Insert a new property record into the database.

        Args:
            data (Dict[str, Any]): Dictionary containing property fields.

        Returns:
            int: The newly created property ID.
        """
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO properties (address, price, beds, baths, sqft, location, amenities, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        data.get("address", ""),
                        float(data.get("price", 0)),
                        int(data.get("beds", 0)),
                        float(data.get("baths", 0)),
                        int(data.get("sqft", 0)),
                        data.get("location", ""),
                        data.get("amenities", ""),
                        data.get("description", ""),
                    ),
                )
                return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Error inserting property: {e}")
            raise

    def add_favorite(self, user_id: int, property_id: int) -> bool:
        try:
            with self.conn:
                self.conn.execute("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)", (user_id, property_id))
            return True
        except sqlite3.Error:
            return False

    def get_favorites(self, user_id: int) -> List[int]:
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT property_id FROM favorites WHERE user_id = ?", (user_id,))
            return [row["property_id"] for row in cursor.fetchall()]
        except sqlite3.Error:
            return []

    def close(self) -> None:
        """Close the SQLite database connection."""
        if self.conn:
            self.conn.close()
