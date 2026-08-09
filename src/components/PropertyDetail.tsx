import React from 'react';
import { Property } from '../types';
import {
  X,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  CheckCircle2
} from 'lucide-react';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onToggleFavorite: (propertyId: number) => void;
  isFavorite: boolean;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&q=80&w=1200'
];

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  onClose,
  onToggleFavorite,
  isFavorite
}) => {
  const amenities = property.amenities
    ? property.amenities.split(',').map((a) => a.trim())
    : [];

  const pricePerSqft = (property.price / Math.max(1, property.sqft)).toFixed(2);
  const imageUrl = PLACEHOLDER_IMAGES[property.id % PLACEHOLDER_IMAGES.length];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-container/10 text-primary border border-primary-container/30 rounded-full text-xs font-semibold">
              Property ID #{property.id}
            </span>
            <h2 className="text-lg font-headline-sm text-on-surface truncate max-w-md">
              {property.address}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Top Hero Image Banner */}
          <div className="relative h-64 sm:h-96 w-full">
            <img 
              src={imageUrl} 
              alt={property.address} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-6 right-6 flex items-center gap-3">
               <button
                onClick={() => onToggleFavorite(property.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-md ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
               <span className="px-3.5 py-1.5 bg-black/60 backdrop-blur-md text-white font-label-md text-sm rounded-full border border-white/20 w-max flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-fixed-dim" />
                {property.location}
              </span>
              <div className="text-4xl sm:text-5xl font-display-lg text-white tracking-tight">
                ${property.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-center">
                <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-headline-sm text-on-surface">{property.beds}</div>
                <div className="text-xs font-caption text-secondary">Bedrooms</div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-center">
                <Bath className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-headline-sm text-on-surface">{property.baths}</div>
                <div className="text-xs font-caption text-secondary">Bathrooms</div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-center">
                <Maximize2 className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-headline-sm text-on-surface">{property.sqft.toLocaleString()}</div>
                <div className="text-xs font-caption text-secondary">Square Feet</div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-center">
                <span className="text-xl font-headline-sm text-primary">$</span>
                <div className="text-xl font-headline-sm text-on-surface inline-block">{pricePerSqft}</div>
                <div className="text-xs font-caption text-secondary">Price / Sq Ft</div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-label-md text-on-surface uppercase tracking-wider mb-3">
                Property Description
              </h3>
              <p className="text-body-md font-body-md text-secondary leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            {amenities.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-label-md text-on-surface uppercase tracking-wider mb-4">
                  Included Amenities & Features
                </h3>
                <div className="flex flex-wrap gap-3">
                  {amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low text-primary border border-primary/20 rounded-lg text-sm font-label-md"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
