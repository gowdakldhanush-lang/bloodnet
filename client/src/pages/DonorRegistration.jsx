import { useState } from 'react';
import axios from 'axios';
import LocationSearch from '../components/LocationSearch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function DonorRegistration() {
    const [form, setForm] = useState({
        name: '',
        bloodType: '',
        gender: '',
        email: '',
        phone: '',
        lat: '',
        lng: '',
        locationText: '',
        lastDonationDate: '',
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = (loc) => {
        setForm({ ...form, locationText: loc.text, lat: loc.lat, lng: loc.lng });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        let finalLat = form.lat;
        let finalLng = form.lng;

        if (form.locationText && (!form.lat || !form.lng)) {
            try {
                const geocodeRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.locationText)}&format=json&limit=1`);
                if (geocodeRes.data && geocodeRes.data.length > 0) {
                    finalLat = geocodeRes.data[0].lat;
                    finalLng = geocodeRes.data[0].lon;
                    setForm(prev => ({ ...prev, lat: finalLat, lng: finalLng }));
                } else {
                    setStatus({ type: 'error', message: 'Could not find the entered location. Please try a different address.' });
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setStatus({ type: 'error', message: 'Failed to find location address.' });
                setLoading(false);
                return;
            }
        } else if (!form.lat || !form.lng) {
            setStatus({ type: 'error', message: 'Please provide a location or use auto-detect.' });
            setLoading(false);
            return;
        }

        try {
            const payload = { ...form, lat: finalLat, lng: finalLng };
            const res = await axios.post(`${API_URL}/register-donor`, payload);
            setStatus({ type: 'success', message: `✅ ${res.data.message} (ID: ${res.data.id})` });
            setForm({
                name: '', bloodType: '', gender: '', email: '',
                phone: '', lat: '', lng: '', locationText: '', lastDonationDate: '',
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Registration failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Donor Registration</h1>
                <p>Register as a blood donor and help save lives in emergencies</p>
            </div>

            <div className="form-container">
                {status && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card form-card">
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Blood Type *</label>
                            <select
                                name="bloodType"
                                value={form.bloodType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Select blood type</option>
                                {bloodTypes.map((bt) => (
                                    <option key={bt} value={bt}>{bt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+91-9876543210"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ zIndex: 10 }}>
                        <label className="form-label">Location *</label>
                        <LocationSearch
                            initialLocationText={form.locationText}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Last Donation Date</label>
                        <input
                            type="date"
                            name="lastDonationDate"
                            value={form.lastDonationDate}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? '⏳ Registering...' : '🩸 Register as Donor'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DonorRegistration;
