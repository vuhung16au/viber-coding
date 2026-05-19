import admin from 'firebase-admin';

// Construct service account from environment variables
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
};

const hasAdminCredentials = Boolean(
  serviceAccount.project_id &&
  serviceAccount.client_email &&
  serviceAccount.private_key
);

let adminDb = null;
let adminAuth = null;

if (hasAdminCredentials) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  }

  adminDb = admin.database();
  adminAuth = admin.auth();
} else {
  console.warn('Firebase Admin credentials are not configured; admin checks will return false.');
}

/**
 * Checks if a user is an admin by looking up their custom claims or a dedicated admins node in the database.
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function checkIfUserIsAdminServer(userId) {
  if (!adminDb) {
    return false;
  }

  // Option 1: Check a dedicated admins node in the database
  const adminRef = adminDb.ref(`admins/${userId}`);
  const snapshot = await adminRef.get();
  if (snapshot.exists()) {
    return true;
  }
  // Option 2: Check custom claims (uncomment if you use custom claims)
  // const user = await adminAuth.getUser(userId);
  // return user.customClaims && user.customClaims.admin === true;
  return false;
}

export { adminDb, adminAuth };
