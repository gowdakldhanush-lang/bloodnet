import { useState } from 'react';
import axios from 'axios';

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
        lastDonationDate: '',
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const detectLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm((prev) => ({
                        ...prev,
                        lat: pos.coords.latitude.toFixed(6),
                        lng: pos.coords.longitude.toFixed(6),
                    }));
                    setStatus({ type: 'success', message: '📍 Location detected successfully!' });
                },
                (err) => {
                    setStatus({ type: 'error', message: 'Failed to detect location. Please enter manually.' });
                }
            );
        } else {
            setStatus({ type: 'error', message: 'Geolocation not supported by your browser.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await axios.post(`${API_URL}/register-donor`, form);
            setStatus({ type: 'success', message: `✅ ${res.data.message} (ID: ${res.data.id})` });
            setForm({
                name: '', bloodType: '', gender: '', email: '',
                phone: '', lat: '', lng: '', lastDonationDate: '',
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

                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <div className="form-row">
                            <input
                                type="number"
                                name="lat"
                                value={form.lat}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Latitude"
                                step="any"
                            />
                            <input
                                type="number"
                                name="lng"
                                value={form.lng}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Longitude"
                                step="any"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '8px' }}
                        >
                            📍 Auto-detect Location
                        </button>
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
