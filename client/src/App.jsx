import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DonorRegistration from './pages/DonorRegistration';
import RequestBlood from './pages/RequestBlood';
import MapView from './pages/MapView';
import DonorDashboard from './pages/DonorDashboard';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<DonorRegistration />} />
                <Route path="/request" element={<RequestBlood />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/dashboard" element={<DonorDashboard />} />
            </Routes>
            <footer className="footer">
                <p>© 2026 Smart Emergency Blood Network — Saving Lives Together 🩸</p>
            </footer>
        </Router>
    );
}

export default App;
