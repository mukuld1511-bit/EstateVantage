import React, { useState, useEffect, useCallback } from 'react';
import { Property, ActiveTab, SearchFilters } from './types';
import { Navbar } from './components/Navbar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetail } from './components/PropertyDetail';
import { ChatRAG } from './components/ChatRAG';
import { FavoritesList } from './components/FavoritesList';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [marketInsight, setMarketInsight] = useState<string>('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  // Fetch Dynamic Insight
  const fetchMarketInsight = (query: string) => {
    setIsGeneratingInsight(true);
    fetch(`${API_URL}/api/market-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, filters: {} })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.insight) {
          setMarketInsight(data.insight);
        }
      })
      .catch((err) => {
        console.error('Error fetching market insight:', err);
        setMarketInsight('Unable to generate AI market insights at this time.');
      })
      .finally(() => setIsGeneratingInsight(false));
  };

  // Load Initial Properties
  const fetchInitialProperties = useCallback(() => {
    setIsLoadingSearch(true);
    fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '', filters: {} })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setAllProperties(data.results);
          setSearchResults(data.results);
          fetchMarketInsight('');
        }
      })
      .catch((err) => console.error('Error loading initial properties:', err))
      .finally(() => setIsLoadingSearch(false));
  }, []);

  const fetchFavorites = useCallback(() => {
    fetch(`${API_URL}/api/user/favorites`)
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites) {
          setFavoriteIds(data.favorites.map((p: Property) => p.id));
        }
      })
      .catch((err) => console.error('Error fetching favorites:', err));
  }, []);

  useEffect(() => {
    fetchInitialProperties();
    fetchFavorites();
  }, [fetchInitialProperties, fetchFavorites]);

  const handleSearchClick = () => {
    setIsLoadingSearch(true);
    
    // Convert selectedPrice back to standard filters if needed, 
    // or pass the raw query down. For now, doing a basic text query to the RAG backend.
    fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchInput, filters: {} })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setSearchResults(data.results);
          fetchMarketInsight(searchInput);
        }
      })
      .catch((err) => console.error('Error performing search:', err))
      .finally(() => setIsLoadingSearch(false));
  };

  const handleToggleFavorite = (propertyId: number) => {
    const isFav = favoriteIds.includes(propertyId);
    if (isFav) {
      fetch(`${API_URL}/api/favorites/${propertyId}`, { method: 'DELETE' })
        .then(() => setFavoriteIds(favoriteIds.filter((id) => id !== propertyId)))
        .catch(console.error);
    } else {
      fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId })
      })
        .then(() => setFavoriteIds([...favoriteIds, propertyId]))
        .catch(console.error);
    }
  };

  const favoriteProperties = allProperties.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        favoriteCount={favoriteIds.length} 
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col w-full">
        
        {activeTab === 'search' && (
          <>
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] w-full bg-surface-container-lowest">
              <div 
                className="absolute inset-0 bg-cover bg-center w-full h-full"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/30 to-transparent"></div>
              </div>
              
              <div className="absolute inset-0 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex items-end pb-24">
                <div className="max-w-2xl text-on-tertiary">
                  <p className="text-label-md font-label-md uppercase tracking-widest mb-4 opacity-90">Exclusive Listing</p>
                  <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg mb-6 leading-tight">
                    The Pinnacle of Coastal Living
                  </h1>
                  <p className="text-body-lg font-body-lg mb-8 opacity-90">
                    Experience unparalleled architectural elegance in this modernist masterpiece overlooking the Pacific.
                  </p>
                  <button className="inline-flex items-center justify-center border border-on-tertiary text-on-tertiary px-8 py-3 rounded text-label-md font-label-md uppercase tracking-wider hover:bg-on-tertiary hover:text-primary-container transition-colors group cursor-pointer">
                    Explore Property
                    <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Search Bar */}
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop -mt-8 relative z-10 w-full">
              <div className="bg-surface-container-lowest shadow-sm rounded-lg p-6 border border-outline-variant flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="flex-1 w-full relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">location_on</span>
                  <input 
                    type="text" 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by location, neighborhood, or ZIP"
                    className="w-full pl-10 pr-4 py-3 border-b border-outline-variant focus:border-primary focus:outline-none bg-transparent text-body-md font-body-md text-on-surface placeholder:text-outline transition-colors rounded-none"
                  />
                </div>
                
                <div className="flex-1 w-full md:w-auto flex gap-4">
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full py-3 border-b border-outline-variant focus:border-primary focus:outline-none bg-transparent text-body-md font-body-md text-on-surface appearance-none rounded-none cursor-pointer"
                  >
                    <option value="">Property Type</option>
                    <option value="house">House</option>
                    <option value="condo">Condo / Apartment</option>
                    <option value="estate">Estate</option>
                  </select>
                  
                  <select 
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="w-full py-3 border-b border-outline-variant focus:border-primary focus:outline-none bg-transparent text-body-md font-body-md text-on-surface appearance-none rounded-none cursor-pointer"
                  >
                    <option value="">Price Range</option>
                    <option value="1">$1M - $5M</option>
                    <option value="5">$5M - $10M</option>
                    <option value="10">$10M+</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleSearchClick}
                  disabled={isLoadingSearch}
                  className="w-full md:w-auto bg-primary-container text-on-tertiary px-8 py-3 rounded text-label-md font-label-md uppercase tracking-wider hover:bg-primary transition-colors flex-shrink-0"
                >
                  {isLoadingSearch ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Split View Layout */}
            <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-16 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              
              {/* Left Column: RAG Assistant (7 columns) */}
              <section className="lg:col-span-7 flex flex-col">
                <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-8">
                  <h2 className="font-headline-md text-headline-md text-on-surface">AI Assistant</h2>
                  <span className="text-caption font-caption text-secondary">Natural Language Search</span>
                </div>
                
                <div className="flex-1 w-full relative" style={{ minHeight: '600px' }}>
                  <div className="absolute inset-0">
                    <ChatRAG
                      onViewDetail={setSelectedProperty}
                      onToggleFavorite={handleToggleFavorite}
                      favorites={favoriteIds}
                    />
                  </div>
                </div>

                {/* Contextual Insight Widget */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-start space-x-4 mt-6">
                  <div className="bg-primary-container p-2 rounded-full text-on-primary-container shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      {isGeneratingInsight ? 'model_training' : 'lightbulb'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface mb-1 flex items-center gap-2">
                      AI Market Insight 
                      {isGeneratingInsight && <span className="text-xs text-primary animate-pulse">(Generating...)</span>}
                    </h4>
                    <p className="text-caption font-caption text-secondary">
                      {isGeneratingInsight 
                        ? "Analyzing current properties to generate market insights..." 
                        : marketInsight || "No insights available for this search."}
                    </p>
                  </div>
                </div>
              </section>

              {/* Right Column: Properties (5 columns) */}
              <aside className="lg:col-span-5 flex flex-col space-y-6 sticky top-28 h-fit">
                <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Database Results</h2>
                  <div className="flex space-x-4">
                    <button className="flex items-center text-secondary hover:text-primary transition-colors text-caption font-caption cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] mr-1">filter_list</span> Filter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 max-h-[800px] overflow-y-auto pr-2 pb-4">
                  {searchResults.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onViewDetail={setSelectedProperty}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favoriteIds.includes(property.id)}
                    />
                  ))}
                  {searchResults.length === 0 && (
                    <div className="text-center py-12 text-secondary text-caption font-caption border border-outline-variant border-dashed rounded-lg">
                      No properties found. Try asking the AI Assistant!
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
            <h1 className="text-headline-md font-headline-md text-on-surface mb-8">Saved Properties</h1>
            <FavoritesList
              favoriteProperties={favoriteProperties}
              onViewDetail={setSelectedProperty}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-surface-container w-full py-16 mt-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-4 mb-8 md:mb-0">
            <div className="text-headline-sm font-headline-sm text-on-surface mb-4">EstateVantage</div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              © 2026 EstateVantage. All rights reserved. The Luxury of Space.
            </p>
          </div>
          <div className="md:col-span-8 flex flex-wrap gap-8 md:justify-end">
            <a href="#" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">About</a>
            <a href="#" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Editorial Policy</a>
            <a href="#" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Market Reports</a>
            <a href="#" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Contact</a>
            <a href="#" className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isFavorite={favoriteIds.includes(selectedProperty.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
