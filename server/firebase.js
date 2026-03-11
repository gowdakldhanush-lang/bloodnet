const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
// Option 1: Using service account JSON file path
// Option 2: Using environment variables
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
  : {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  };

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase initialization failed:', error.message);
  console.warn('   Server will run but database operations will fail.');
  console.warn('   Please configure your Firebase credentials in .env');
}

const db = admin.firestore();

module.exports = { admin, db };
