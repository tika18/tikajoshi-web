import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (clientEmail && privateKey && databaseURL) {
    try {
      const formattedKey = privateKey.replace(/\\n/g, "\n");
      return initializeApp({
        credential: cert({
          clientEmail,
          privateKey: formattedKey,
          projectId: projectId,
        }),
        databaseURL,
      });
    } catch (err) {
      console.error("Failed to initialize firebase-admin with cert credential:", err);
    }
  }

  // Fallback
  try {
    return initializeApp({
      databaseURL,
    });
  } catch (err) {
    console.warn("firebase-admin fallback initialization warning:", err);
    return null;
  }
}

export const adminApp = getFirebaseAdminApp();
export const adminDb = adminApp ? getDatabase(adminApp) : null;
