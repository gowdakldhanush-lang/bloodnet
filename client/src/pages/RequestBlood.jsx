import { useState } from 'react';
import axios from 'axios';
import DonorCard from '../components/DonorCard';
import { notifyDonors } from '../utils/emailService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function RequestBlood() {
    const [form, setForm] = useState({
        bloodType: '',
        lat: '',
        lng: '',
        radiusKm: '50',
        requesterName: '',
        requesterPhone: '',
        urgency: 'normal',
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [emailStatus, setEmailStatus] = useState(null);

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
                    setStatus({ type: 'success', message: '📍 Location detected!' });
                },
                () => {
                    setStatus({ type: 'error', message: 'Location detection failed.' });
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setResults(null);
        setEmailStatus(null);

        try {
            const res = await axios.post(`${API_URL}/blood-request`, form);
            setResults(res.data);
            setStatus({
                type: 'success',
                message: `Found ${res.data.count} eligible donor(s) nearby!`,
            });

            // Send email notifications to matched donors
            if (res.data.donors && res.data.donors.length > 0) {
                setEmailStatus('sending');
                try {
                    await notifyDonors(
                        {
                            bloodType: form.bloodType,
                            requesterName: form.requesterName,
                            requesterPhone: form.requesterPhone,
                            urgency: form.urgency,
                        },
                        res.data.donors
                    );
                    setEmailStatus('sent');
                } catch {
                    setEmailStatus('failed');
                }
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Failed to process request.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Request Blood</h1>
                <p>Find nearby compatible donors for emergency blood needs</p>
            </div>

            <div className="form-container">
                {status && (
                    <div className={`alert alert-${status.type}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card form-card">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Blood Type Needed *</label>
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
                            <label className="form-label">Urgency</label>
                            <select
                                name="urgency"
                                value={form.urgency}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Your Name</label>
                            <input
                                type="text"
                                name="requesterName"
                                value={form.requesterName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Phone</label>
                            <input
                                type="tel"
                                name="requesterPhone"
                                value={form.requesterPhone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+91-XXXXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Location *</label>
                        <div className="form-row">
                            <input
                                type="number"
                                name="lat"
                                value={form.lat}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Latitude"
                                step="any"
                                required
                            />
                            <input
                                type="number"
                                name="lng"
                                value={form.lng}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Longitude"
                                step="any"
                                required
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
                        <label className="form-label">Search Radius (km)</label>
                        <input
                            type="number"
                            name="radiusKm"
                            value={form.radiusKm}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="50"
                            min="1"
                            max="200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? '⏳ Searching...' : '🔍 Find Donors'}
                    </button>
                </form>

                {/* Email notification status */}
                {emailStatus && (
                    <div className={`alert ${emailStatus === 'sent' ? 'alert-success' : emailStatus === 'failed' ? 'alert-error' : 'alert-info'}`}
                        style={{ marginTop: '16px' }}
                    >
                        {emailStatus === 'sending' && '📧 Sending notifications to donors...'}
                        {emailStatus === 'sent' && '📧 Email notifications sent to eligible donors!'}
                        {emailStatus === 'failed' && '📧 Email notifications could not be sent (check EmailJS config).'}
                    </div>
                )}

                {/* Results */}
                {results && (
                    <div className="results-section fade-in">
                        <div className="results-header">
                            <h3>Matched Donors</h3>
                            <span className="results-count">{results.count} found</span>
                        </div>
                        {results.donors && results.donors.length > 0 ? (
                            results.donors.map((donor) => (
                                <DonorCard key={donor.id} donor={donor} />
                            ))
                        ) : (
                            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    No eligible donors found in the specified area.<br />
                                    Try increasing the search radius.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequestBlood;
