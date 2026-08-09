import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onViewDetail: (property: Property) => void;
  onToggleFavorite: (propertyId: number) => void;
  isFavorite: boolean;
}

// A curated list of luxury real estate placeholder images
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&q=80&w=800'
];

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetail,
  onToggleFavorite,
  isFavorite
}) => {
  // Use a stable image based on the property ID
  const imageUrl = PLACEHOLDER_IMAGES[property.id % PLACEHOLDER_IMAGES.length];

  return (
    <article 
      onClick={() => onViewDetail(property)}
      className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0px_4px_20px_rgba(30,41,59,0.05)] hover:shadow-[0px_12px_32px_rgba(30,41,59,0.08)] transition-shadow duration-300 border border-outline-variant cursor-pointer group flex flex-col"
    >
      <div className="aspect-video relative overflow-hidden bg-surface-container shrink-0">
        <img 
          src={imageUrl}
          alt={property.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        
        <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1 rounded text-label-md font-label-md text-on-surface shadow-sm">
          {property.location}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
          className="absolute top-4 right-4 p-2 bg-surface-container-lowest/90 backdrop-blur rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'text-rose-500 fill-current' : 'text-secondary'}`}>
            favorite
          </span>
        </button>

        {/* Highlight Badges */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
           {property.match_score !== undefined && (
             <span className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded text-xs shadow-md flex items-center gap-1">
               <span className="material-symbols-outlined text-[14px]">award_star</span>
               Match Score: {property.match_score}
             </span>
           )}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-label-md text-label-md text-primary mb-2">${property.price.toLocaleString()}</p>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 line-clamp-1 group-hover:text-primary transition-colors">{property.address}</h2>
        </div>
        
        <div className="flex items-center space-x-6 text-secondary text-caption font-caption mt-auto">
          <span className="flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-1">bed</span> 
            {property.beds} Beds
          </span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-1">shower</span> 
            {property.baths} Baths
          </span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-1">square_foot</span> 
            {property.sqft.toLocaleString()} Sq Ft
          </span>
        </div>
      </div>
    </article>
  );
};
