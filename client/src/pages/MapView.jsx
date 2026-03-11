import { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function MapView() {
    const [userLocation, setUserLocation] = useState(null);
    const [donors, setDonors] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                () => {
                    // Default to Bangalore if geolocation fails
                    setUserLocation({ lat: 12.9716, lng: 77.5946 });
                }
            );
        } else {
            setUserLocation({ lat: 12.9716, lng: 77.5946 });
        }

        // Fetch donors and blood banks
        const fetchData = async () => {
            try {
                const [donorsRes, banksRes] = await Promise.all([
                    axios.get(`${API_URL}/donors`).catch(() => ({ data: { donors: [] } })),
                    axios.get(`${API_URL}/blood-banks`).catch(() => ({ data: { bloodBanks: [] } })),
                ]);

                setDonors(donorsRes.data.donors || []);
                setBloodBanks(banksRes.data.bloodBanks || []);
            } catch (err) {
                console.error('Error fetching map data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading map data...</p>
            </div>
        );
    }

    const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [12.9716, 77.5946];

    return (
        <div className="map-container">
            <MapComponent
                center={center}
                zoom={12}
                userLocation={userLocation}
                donors={donors.filter((d) => d.available)}
                bloodBanks={bloodBanks}
            />
            <div className="map-legend">
                <h4>Legend</h4>
                <div className="map-legend-item">
                    <span className="map-legend-dot blue"></span> Your Location
                </div>
                <div className="map-legend-item">
                    <span className="map-legend-dot red"></span> Blood Donors
                </div>
                <div className="map-legend-item">
                    <span className="map-legend-dot green"></span> Blood Banks
                </div>
            </div>
        </div>
    );
}

export default MapView;
