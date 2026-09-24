import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Environment variables take precedence for production / Cloudflare Workers deployment.
// If not supplied, falls back to local firebase-applet-config.json for AI Studio dev.
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envFirestoreDbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

let localConfig: Record<string, string> = {};
try {
  const imported = await import('../../firebase-applet-config.json');
  localConfig = (imported && (imported.default || imported)) || {};
} catch {
  localConfig = {};
}

const firebaseConfig = {
  apiKey: envApiKey || localConfig.apiKey || '',
  projectId: envProjectId || localConfig.projectId || '',
  appId: envAppId || localConfig.appId || '',
  authDomain:
    envAuthDomain ||
    localConfig.authDomain ||
    (envProjectId ? `${envProjectId}.firebaseapp.com` : ''),
  storageBucket:
    envStorageBucket ||
    localConfig.storageBucket ||
    (envProjectId ? `${envProjectId}.firebasestorage.app` : ''),
  messagingSenderId: envMessagingSenderId || localConfig.messagingSenderId || '',
  measurementId: envMeasurementId || localConfig.measurementId || '',
};

const databaseId = envFirestoreDbId || localConfig.firestoreDatabaseId || undefined;

export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const db: Firestore = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);

// Test connection on boot if configuration is populated
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  (async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is currently offline or unreachable.');
      }
    }
  })();
}

export default app;
