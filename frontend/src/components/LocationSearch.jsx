import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

export default function LocationSearch({ 
  label, 
  placeholder, 
  value, 
  onSelect,
  icon: Icon,
  required 
}) {
  const [query, setQuery] = useState(value?.city || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (value?.city) {
      setQuery(value.city);
    }
  }, [value]);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_API_KEY}&limit=5&language=en&country=IN`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const results = data.features.map(feature => ({
          name: feature.place_name,
          city: feature.text,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          fullAddress: feature.place_name
        }));
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect({
        city: suggestion.city,
        landmark: '',
        coordinates: {
          lat: suggestion.lat,
          lng: suggestion.lng
        },
        fullAddress: suggestion.fullAddress
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (onSelect) {
      onSelect(null);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
          placeholder={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-xs mt-1">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-3"
              >
                <MapPinIcon className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{suggestion.city}</div>
                  <div className="text-sm text-gray-500 truncate">{suggestion.fullAddress}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No locations found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}