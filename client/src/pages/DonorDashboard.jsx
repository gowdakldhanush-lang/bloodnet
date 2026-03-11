import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DonorDashboard() {
    const [email, setEmail] = useState('');
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [toggling, setToggling] = useState(false);

    const lookupDonor = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setStatus(null);
        setDonor(null);

        try {
            const res = await axios.get(`${API_URL}/donors/email/${encodeURIComponent(email)}`);
            setDonor(res.data.donor);
        } catch (err) {
            if (err.response?.status === 404) {
                setStatus({ type: 'error', message: 'No donor found with this email address.' });
            } else {
                setStatus({ type: 'error', message: 'Failed to look up donor. Is the server running?' });
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        if (!donor) return;
        setToggling(true);

        try {
            const newAvailability = !donor.available;
            await axios.put(`${API_URL}/donors/${donor.id}/availability`, {
                available: newAvailability,
            });
            setDonor({ ...donor, available: newAvailability });
            setStatus({
                type: 'success',
                message: newAvailability
                    ? '✅ You are now available for emergency donations!'
                    : '❌ You are now marked as unavailable.',
            });
        } catch {
            setStatus({ type: 'error', message: 'Failed to update availability.' });
        } finally {
            setToggling(false);
        }
    };

    const getCooldownInfo = () => {
        if (!donor?.lastDonationDate) return { eligible: true, message: 'No previous donations recorded' };

        const lastDonation = new Date(donor.lastDonationDate);
        const now = new Date();
        const diffDays = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));
        const cooldown = donor.gender?.toLowerCase() === 'female' ? 120 : 90;
        const remaining = cooldown - diffDays;

        if (remaining <= 0) {
            return { eligible: true, message: `Eligible to donate (last donated ${diffDays} days ago)` };
        }
        return { eligible: false, message: `${remaining} days remaining until eligible (${cooldown}-day cooldown)` };
    };

    const initials = donor?.name
        ? donor.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="page">
            <div className="page-header">
                <h1>Donor Dashboard</h1>
                <p>Manage your donor profile and availability</p>
            </div>

            {/* Lookup Form */}
            <form className="lookup-form" onSubmit={lookupDonor}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your registered email"
                    required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '⏳' : '🔍'} Look Up
                </button>
            </form>

            {status && (
                <div className={`alert alert-${status.type}`} style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
                    {status.message}
                </div>
            )}

            {/* Dashboard Content */}
            {donor && (
                <div className="dashboard-grid fade-in">
                    {/* Profile Card */}
                    <div className="card profile-card">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-name">{donor.name}</div>
                        <div className="profile-email">{donor.email}</div>
                        <span className="blood-badge" style={{ fontSize: '1rem', padding: '6px 16px' }}>
                            {donor.bloodType}
                        </span>

                        <div style={{ marginTop: '20px' }}>
                            <div className="profile-stat">
                                <span className="label">Gender</span>
                                <span className="value">{donor.gender}</span>
                            </div>
                            <div className="profile-stat">
                                <span className="label">Phone</span>
                                <span className="value">{donor.phone}</span>
                            </div>
                            <div className="profile-stat">
                                <span className="label">Location</span>
                                <span className="value">
                                    {donor.location?.lat?.toFixed(4)}, {donor.location?.lng?.toFixed(4)}
                                </span>
                            </div>
                            <div className="profile-stat">
                                <span className="label">Registered</span>
                                <span className="value">
                                    {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div className="availability-toggle">
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {donor.available ? '✅ Available' : '❌ Unavailable'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Emergency donations
                                </div>
                            </div>
                            <div
                                className={`toggle-switch ${donor.available ? 'active' : ''}`}
                                onClick={!toggling ? toggleAvailability : undefined}
                                style={{ cursor: toggling ? 'wait' : 'pointer' }}
                                role="button"
                                tabIndex={0}
                                aria-label="Toggle availability"
                            />
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div>
                        {/* Cooldown Status */}
                        <div className="card" style={{ marginBottom: '16px', padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                                ⏱️ Donation Cooldown
                            </h3>
                            {(() => {
                                const cooldown = getCooldownInfo();
                                return (
                                    <div className={`alert ${cooldown.eligible ? 'alert-success' : 'alert-info'}`} style={{ margin: 0 }}>
                                        {cooldown.message}
                                    </div>
                                );
                            })()}
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                                {donor.gender?.toLowerCase() === 'female'
                                    ? 'Female donors must wait 120 days between donations.'
                                    : 'Male donors must wait 90 days between donations.'}
                            </p>
                        </div>

                        {/* Last Donation */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                                📋 Donation History
                            </h3>
                            {donor.lastDonationDate ? (
                                <div className="profile-stat" style={{ borderTop: 'none' }}>
                                    <span className="label">Last Donation</span>
                                    <span className="value">
                                        {new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    No donation records yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DonorDashboard;
