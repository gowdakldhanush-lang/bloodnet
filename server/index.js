const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { db } = require('./firebase');
const { haversineDistance } = require('./haversine');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// Blood Banks Data (predefined)
// ============================================================
const bloodBanks = [
    {
        id: 1,
        name: 'City Central Blood Bank',
        address: '123 Main Street, Downtown',
        phone: '+91-9876543210',
        lat: 12.9716,
        lng: 77.5946,
        operatingHours: '24/7',
        bloodTypesAvailable: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    {
        id: 2,
        name: 'Red Cross Blood Center',
        address: '456 Health Avenue, Medical District',
        phone: '+91-9876543211',
        lat: 12.9352,
        lng: 77.6245,
        operatingHours: '8:00 AM - 10:00 PM',
        bloodTypesAvailable: ['A+', 'B+', 'O+', 'O-', 'AB+'],
    },
    {
        id: 3,
        name: 'LifeLine Blood Bank',
        address: '789 University Road, North Campus',
        phone: '+91-9876543212',
        lat: 13.0358,
        lng: 77.5970,
        operatingHours: '6:00 AM - 11:00 PM',
        bloodTypesAvailable: ['A+', 'A-', 'B+', 'O+', 'O-', 'AB+', 'AB-'],
    },
    {
        id: 4,
        name: 'Hope Blood Bank',
        address: '321 Hospital Lane, South Zone',
        phone: '+91-9876543213',
        lat: 12.9081,
        lng: 77.6476,
        operatingHours: '24/7',
        bloodTypesAvailable: ['A+', 'B+', 'B-', 'O+', 'O-', 'AB+'],
    },
    {
        id: 5,
        name: 'National Blood Transfusion Center',
        address: '555 Government Complex, East Wing',
        phone: '+91-9876543214',
        lat: 12.9850,
        lng: 77.5533,
        operatingHours: '7:00 AM - 9:00 PM',
        bloodTypesAvailable: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
];

// ============================================================
// Donation Cooldown Check
// ============================================================
function isDonationCooldownSatisfied(gender, lastDonationDate) {
    if (!lastDonationDate) return true; // Never donated before

    const lastDonation = new Date(lastDonationDate);
    const now = new Date();
    const diffDays = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));

    // Male: 90 days, Female: 120 days
    const cooldownDays = gender?.toLowerCase() === 'female' ? 120 : 90;
    return diffDays >= cooldownDays;
}

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => {
    res.json({
        message: '🩸 Smart Emergency Blood Network API',
        status: 'running',
        endpoints: [
            'POST /register-donor',
            'GET /donors',
            'POST /blood-request',
            'GET /blood-banks',
        ],
    });
});

// ── POST /register-donor ────────────────────────────────────
app.post('/register-donor', async (req, res) => {
    try {
        const { name, bloodType, gender, email, phone, lat, lng, lastDonationDate } = req.body;

        // Validation
        if (!name || !bloodType || !gender || !email || !phone) {
            return res.status(400).json({ error: 'Missing required fields: name, bloodType, gender, email, phone' });
        }

        // Check for duplicates
        const existingDonorsByEmail = await db.collection('donors').where('email', '==', email).get();
        const existingDonorsByPhone = await db.collection('donors').where('phone', '==', phone).get();

        if (!existingDonorsByEmail.empty || !existingDonorsByPhone.empty) {
            return res.status(409).json({ error: 'A donor with this email or phone number is already registered.' });
        }

        const donorData = {
            name,
            bloodType,
            gender,
            email,
            phone,
            location: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
            lastDonationDate: lastDonationDate || null,
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection('donors').add(donorData);

        res.status(201).json({
            message: 'Donor registered successfully!',
            id: docRef.id,
            donor: { id: docRef.id, ...donorData },
        });
    } catch (error) {
        console.error('Error registering donor:', error);
        res.status(500).json({ error: 'Failed to register donor' });
    }
});

// ── GET /donors ─────────────────────────────────────────────
app.get('/donors', async (req, res) => {
    try {
        const { bloodType } = req.query;
        let query = db.collection('donors');

        if (bloodType) {
            query = query.where('bloodType', '==', bloodType);
        }

        const snapshot = await query.get();
        const donors = [];

        snapshot.forEach((doc) => {
            donors.push({ id: doc.id, ...doc.data() });
        });

        res.json({ donors, count: donors.length });
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({ error: 'Failed to fetch donors' });
    }
});

// ── POST /blood-request ─────────────────────────────────────
app.post('/blood-request', async (req, res) => {
    try {
        const { bloodType, lat, lng, radiusKm = 50, requesterName, requesterPhone, urgency = 'normal' } = req.body;

        if (!bloodType || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Missing required fields: bloodType, lat, lng' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radius = parseFloat(radiusKm);

        // Fetch matching donors
        const snapshot = await db.collection('donors')
            .where('bloodType', '==', bloodType)
            .where('available', '==', true)
            .get();

        const eligibleDonors = [];

        snapshot.forEach((doc) => {
            const donor = { id: doc.id, ...doc.data() };

            // Check cooldown
            if (!isDonationCooldownSatisfied(donor.gender, donor.lastDonationDate)) {
                return; // Skip - cooldown not satisfied
            }

            // Calculate distance
            const distance = haversineDistance(
                userLat, userLng,
                donor.location?.lat || 0, donor.location?.lng || 0
            );

            // Check if in radius
            if (distance <= radius) {
                // Deduplication logic for results strictly by email
                const isDuplicate = eligibleDonors.some(d => d.email === donor.email || d.phone === donor.phone);
                if (!isDuplicate) {
                    eligibleDonors.push({ ...donor, distance: Math.round(distance * 100) / 100 });
                }
            }
        });

        // Sort by nearest distance
        eligibleDonors.sort((a, b) => a.distance - b.distance);

        // Store the blood request
        const requestData = {
            bloodType,
            location: { lat: userLat, lng: userLng },
            radiusKm: radius,
            requesterName: requesterName || 'Anonymous',
            requesterPhone: requesterPhone || '',
            urgency,
            matchedDonors: eligibleDonors.length,
            createdAt: new Date().toISOString(),
        };

        const requestRef = await db.collection('bloodRequests').add(requestData);

        res.json({
            message: `Found ${eligibleDonors.length} eligible donor(s) nearby`,
            requestId: requestRef.id,
            donors: eligibleDonors,
            count: eligibleDonors.length,
        });
    } catch (error) {
        console.error('Error processing blood request:', error);
        res.status(500).json({ error: 'Failed to process blood request' });
    }
});

// ── GET /blood-banks ────────────────────────────────────────
app.get('/blood-banks', (req, res) => {
    res.json({ bloodBanks, count: bloodBanks.length });
});

// ── PUT /donors/:id/availability ────────────────────────────
app.put('/donors/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;

        if (available === undefined) {
            return res.status(400).json({ error: 'Missing required field: available' });
        }

        await db.collection('donors').doc(id).update({
            available: Boolean(available),
            updatedAt: new Date().toISOString(),
        });

        res.json({ message: 'Availability updated successfully', available: Boolean(available) });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: 'Failed to update availability' });
    }
});

// ── GET /donors/email/:email ────────────────────────────────
app.get('/donors/email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const snapshot = await db.collection('donors')
            .where('email', '==', email)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No donor found with this email' });
        }

        const donors = [];
        snapshot.forEach((doc) => {
            donors.push({ id: doc.id, ...doc.data() });
        });

        res.json({ donor: donors[0] });
    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).json({ error: 'Failed to fetch donor' });
    }
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🩸 Smart Emergency Blood Network API`);
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Press Ctrl+C to stop\n`);
});
