import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const links = [
        { path: '/', label: 'Home' },
        { path: '/register', label: 'Register' },
        { path: '/request', label: 'Request Blood' },
        { path: '/map', label: 'Map' },
        { path: '/dashboard', label: 'Dashboard' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <span className="navbar-logo-icon">🩸</span>
                    <span>BloodNet</span>
                </Link>

                <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
                    {links.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={location.pathname === link.path ? 'active' : ''}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? '✕' : '☰'}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
