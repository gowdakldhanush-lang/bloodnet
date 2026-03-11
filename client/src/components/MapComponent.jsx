import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icons
const createIcon = (color) =>
    new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
    });

const userIcon = createIcon('#3b82f6');
const donorIcon = createIcon('#ef4444');
const bankIcon = createIcon('#10b981');

function MapComponent({ center = [12.9716, 77.5946], zoom = 12, userLocation, donors = [], bloodBanks = [] }) {
    return (
        <div className="map-wrapper">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                            <strong>📍 Your Location</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Donor Markers */}
                {donors.map((donor, idx) => (
                    <Marker
                        key={donor.id || idx}
                        position={[donor.location?.lat || 0, donor.location?.lng || 0]}
                        icon={donorIcon}
                    >
                        <Popup>
                            <strong>🩸 {donor.name}</strong><br />
                            Blood Type: {donor.bloodType}<br />
                            {donor.available ? '✅ Available' : '❌ Unavailable'}<br />
                            📞 {donor.phone}
                        </Popup>
                    </Marker>
                ))}

                {/* Blood Bank Markers */}
                {bloodBanks.map((bank) => (
                    <Marker
                        key={bank.id}
                        position={[bank.lat, bank.lng]}
                        icon={bankIcon}
                    >
                        <Popup>
                            <strong>🏥 {bank.name}</strong><br />
                            {bank.address}<br />
                            📞 {bank.phone}<br />
                            🕐 {bank.operatingHours}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default MapComponent;
