import React, { useState, useEffect, useRef } from 'react';
import { GeoLocation } from '../types';
import { searchLocations } from '../utils/weatherApi';
import { Search, Star, MapPin, Loader, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocationSearchProps {
  onSelectLocation: (location: GeoLocation) => void;
  activeLocation: GeoLocation;
  savedLocations: GeoLocation[];
  onToggleSaveLocation: (location: GeoLocation) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  activeLocation,
  savedLocations,
  onToggleSaveLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const locations = await searchLocations(query);
        setResults(locations);
      } catch (err) {
        console.error('Failed to query locations:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle clicks outside the search suggestions box to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setIsDropdownOpen(false);
    setQuery('');
  };

  const isLocSaved = (loc: GeoLocation) => {
    return savedLocations.some((s) => s.id === loc.id);
  };

  return (
    <div className="relative w-full" id="location-search-module">
      {/* Search Bar input */}
      <div className="flex gap-2" ref={dropdownRef}>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search city, region, or country..."
            className="w-full h-12 pl-11 pr-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/85 dark:border-slate-800/80 rounded-full text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-sans transition-all shadow-xs"
            id="location-search-input"
          />
          <div className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">
            {isLoading ? (
              <Loader size={16} className="animate-spin text-amber-500" id="search-loader" />
            ) : (
              <Search size={16} id="search-icon" />
            )}
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-3.5 top-[14px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
              id="clear-search-btn"
            >
              <X size={16} />
            </button>
          )}

          {/* Suggestions Dropdown overlay */}
          <AnimatePresence>
            {isDropdownOpen && (results.length > 0 || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-14 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 rounded-[24px] shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
                id="search-suggestions-dropdown"
              >
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-sans flex items-center justify-center gap-2">
                    <Loader size={14} className="animate-spin text-amber-500" />
                    Analyzing geocoding register...
                  </div>
                ) : (
                  <div className="py-1">
                    {results.map((loc) => {
                      const saved = isLocSaved(loc);
                      return (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer text-left"
                          id={`suggestion-row-${loc.id}`}
                        >
                          {/* Main Clickable item body */}
                          <button
                            onClick={() => handleSelectResult(loc)}
                            className="flex-1 flex items-start gap-2.5 text-left cursor-pointer"
                            id={`suggestion-btn-${loc.id}`}
                          >
                            <MapPin size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-sans text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {loc.name}
                              </span>
                              <span className="font-sans text-[10.5px] text-slate-400 dark:text-slate-500">
                                {loc.admin1 ? `${loc.admin1}, ` : ''}
                                {loc.country}
                              </span>
                            </div>
                          </button>

                          {/* Quick Pin / Save Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSaveLocation(loc);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              saved
                                ? 'text-amber-500 hover:bg-amber-500/10'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50'
                            }`}
                            id={`suggestion-star-${loc.id}`}
                            title={saved ? 'Remove from Pinned' : 'Pin to Dashboard'}
                          >
                            <Star size={14} className={saved ? 'fill-amber-500' : ''} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pinned Locations / Saved Havens */}
      {savedLocations.length > 0 && (
        <div className="mt-4" id="pinned-locations-section">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Pinned Havens
            </span>
            <span className="font-sans text-[10px] text-slate-400">
              {savedLocations.length} locations
            </span>
          </div>

          <div className="flex flex-wrap gap-2" id="pinned-locations-flex">
            {savedLocations.map((loc) => {
              const isActive = loc.id === activeLocation.id;
              return (
                <motion.div
                  key={loc.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-slate-800 dark:text-slate-100 shadow-sm'
                      : 'bg-white/10 dark:bg-slate-900/30 border-white/10 dark:border-slate-800/40 hover:bg-white/20 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-300'
                  }`}
                  id={`pinned-card-${loc.id}`}
                >
                  <button
                    onClick={() => onSelectLocation(loc)}
                    className="flex items-center gap-1.5 cursor-pointer text-left"
                    id={`pinned-btn-${loc.id}`}
                  >
                    <MapPin size={12} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                    <span className="font-sans text-xs font-semibold">
                      {loc.name}
                    </span>
                    {loc.country_code && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        {loc.country_code}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onToggleSaveLocation(loc)}
                    className="p-0.5 hover:bg-slate-500/10 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer"
                    id={`pinned-unstar-${loc.id}`}
                    title="Unpin"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
