import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './placeSearch.css';

const PlaceSearch = ({ onSelect, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search logic
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API (OpenStreetMap) for free place searching in India
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          addressdetails: 1,
          limit: 10,
          countrycodes: 'in' // Restrict to India
        }
      });

      const formatted = response.data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        shortName: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type
      }));

      setSuggestions(formatted);
    } catch (error) {
      console.error("Place search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query !== initialValue) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions, initialValue]);

  const handleSelect = (place) => {
    setQuery(place.shortName);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(place);
    }
  };

  return (
    <div className="place-search-wrapper">
      <div className="pf-field">
        <label className="pf-label">Destination</label>
        <div className="search-input-container">
          <input
            type="text"
            className="pf-city-input"
            placeholder="Search any place in India (e.g. Manali, Hampi...)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {loading && <div className="search-spinner"></div>}
        </div>

        {showDropdown && (query.length >= 3) && (
          <div className="search-dropdown animate-in">
            {suggestions.length > 0 ? (
              suggestions.map((place) => (
                <div
                  key={place.id}
                  className="search-item"
                  onMouseDown={() => handleSelect(place)}
                >
                  <span className="search-item-icon">📍</span>
                  <div className="search-item-info">
                    <span className="search-item-name">{place.shortName}</span>
                    <span className="search-item-full">{place.name}</span>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className="search-no-results">No places found in India.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceSearch;
