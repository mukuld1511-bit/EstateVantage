export interface Property {
  id: number;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  location: string;
  neighborhood?: string;
  amenities: string;
  description: string;
  created_at?: string;
  search_score?: number;
  match_score?: number;
  score_breakdown?: {
    price_score: number;
    beds_score: number;
    baths_score: number;
    location_score: number;
    amenity_score: number;
    matching_amenities: string[];
  };
}

export interface SearchFilters {
  min_price?: number;
  max_price?: number;
  min_beds?: number;
  min_baths?: number;
  location?: string;
  min_sqft?: number;
}

export interface ClientProfile {
  budget: number;
  min_beds: number;
  min_baths: number;
  preferred_location: string;
  amenities: string[];
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  property_id: number;
}

export type ActiveTab =
  | 'search'
  | 'chat'
  | 'favorites';
