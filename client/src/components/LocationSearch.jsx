import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function LocationSearch({ onLocationSelect, initialLocationText = '' }) {
    const [query, setQuery] = useState(initialLocationText);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const wrapperRef = useRef(null);
    const timeoutRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync external changes
    useEffect(() => {
        setQuery(initialLocationText);
    }, [initialLocationText]);

    const handleSearch = async (searchText) => {
        if (!searchText.trim() || searchText.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=5`
            );
            setSuggestions(res.data || []);
            setShowDropdown(true);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        // Let parent know text changed but we don't have new coords yet
        onLocationSelect({ text: val, lat: '', lng: '' });

        // Debounce search
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            handleSearch(val);
        }, 500);
    };

    const handleSelectSuggestion = (place) => {
        setQuery(place.display_name);
        setShowDropdown(false);
        onLocationSelect({
            text: place.display_name,
            lat: place.lat,
            lng: place.lon,
        });
    };

    const detectLocation = () => {
        if ('geolocation' in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    try {
                        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                        const address = res.data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        setQuery(address);
                        onLocationSelect({ text: address, lat: lat.toString(), lng: lng.toString() });
                    } catch (error) {
                        const fallbackText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        setQuery(fallbackText);
                        onLocationSelect({ text: fallbackText, lat: lat.toString(), lng: lng.toString() });
                    } finally {
                        setIsLocating(false);
                    }
                },
                (err) => {
                    setIsLocating(false);
                    alert('Geolocation detection failed. Please type your location manually.');
                }
            );
        } else {
            alert('Geolocation not supported by your browser.');
        }
    };

    return (
        <div className="location-search-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                className="form-input"
                placeholder="Type an address (e.g., BTM Bengaluru)"
                required
                autoComplete="off"
            />

            {showDropdown && suggestions.length > 0 && (
                <ul className="location-suggestions card" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    listStyle: 'none',
                    margin: '4px 0 0 0',
                    padding: 0,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((place, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelectSuggestion(place)}
                            style={{
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border-color)',
                                fontSize: '0.9rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="button"
                onClick={detectLocation}
                className="btn btn-secondary btn-sm"
                disabled={isLocating}
                style={{ marginTop: '8px' }}
            >
                {isLocating ? '⏳ Detecting...' : '📍 Auto-detect Location'}
            </button>
        </div>
    );
}
