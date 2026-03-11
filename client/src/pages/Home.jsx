import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>🚨</span> SMART EMERGENCY NETWORK
                    </div>
                    <h1>
                        Every Drop<br />
                        <span className="highlight">Saves a Life</span>
                    </h1>
                    <p>
                        Connect with nearby blood donors instantly during emergencies.
                        Smart matching, real-time availability, and instant notifications
                        to save precious time when every second counts.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            🩸 Become a Donor
                        </Link>
                        <Link to="/request" className="btn btn-secondary btn-lg">
                            🔍 Request Blood
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="card stat-card card-hover">
                        <div className="stat-number">8+</div>
                        <div className="stat-label">Blood Types Supported</div>
                    </div>
                    <div className="card stat-card card-hover">
                        <div className="stat-number">50km</div>
                        <div className="stat-label">Search Radius</div>
                    </div>
                    <div className="card stat-card card-hover">
                        <div className="stat-number">24/7</div>
                        <div className="stat-label">Always Available</div>
                    </div>
                    <div className="card stat-card card-hover">
                        <div className="stat-number">&lt;1m</div>
                        <div className="stat-label">Match Time</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>How It Works</h2>
                <div className="features-grid">
                    <div className="card feature-card card-hover">
                        <div className="feature-icon red">🩸</div>
                        <h3>Smart Matching</h3>
                        <p>
                            Our algorithm matches blood requests with nearby donors based on
                            blood type compatibility, availability, and distance — sorted by
                            nearest first.
                        </p>
                    </div>
                    <div className="card feature-card card-hover">
                        <div className="feature-icon green">📍</div>
                        <h3>Location-Based Search</h3>
                        <p>
                            Using Haversine distance calculation to find donors within your
                            specified radius. Real-time map view with donor and blood bank
                            locations.
                        </p>
                    </div>
                    <div className="card feature-card card-hover">
                        <div className="feature-icon blue">📧</div>
                        <h3>Instant Notifications</h3>
                        <p>
                            When an emergency request is created, eligible donors are
                            immediately notified via email so they can respond quickly.
                        </p>
                    </div>
                    <div className="card feature-card card-hover">
                        <div className="feature-icon amber">⏱️</div>
                        <h3>Cooldown Management</h3>
                        <p>
                            Automatic cooldown tracking ensures donor safety — 90 days for
                            male donors and 120 days for female donors between donations.
                        </p>
                    </div>
                    <div className="card feature-card card-hover">
                        <div className="feature-icon purple">🗺️</div>
                        <h3>Blood Bank Locator</h3>
                        <p>
                            Find nearby blood banks on the interactive map with details like
                            operating hours, contact info, and available blood types.
                        </p>
                    </div>
                    <div className="card feature-card card-hover">
                        <div className="feature-icon red">🔄</div>
                        <h3>Availability Toggle</h3>
                        <p>
                            Donors can toggle their availability status anytime. Only
                            available donors appear in emergency search results.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
