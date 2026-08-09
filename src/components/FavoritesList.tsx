import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Heart, Trash2 } from 'lucide-react';

interface FavoritesListProps {
  favoriteProperties: Property[];
  onViewDetail: (property: Property) => void;
  onToggleFavorite: (propertyId: number) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteProperties,
  onViewDetail,
  onToggleFavorite
}) => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Saved Favorite Properties</h1>
            <p className="text-xs text-slate-400">
              Quick access to your bookmarked listings for comparison and client reviews.
            </p>
          </div>
        </div>
      </div>

      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetail={onViewDetail}
              onToggleFavorite={onToggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Favorites Saved Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any property card during search or matching to save properties to your favorites list.
          </p>
        </div>
      )}
    </div>
  );
};
