import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";

import {
  getAuth,
  type Auth,
} from "firebase/auth";

import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";

import {
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";


/**
 * ============================================================
 * FIREBASE CONFIGURATION
 * ============================================================
 *
 * IMPORTANT:
 * This Admin Panel must use the SAME Firebase project
 * as the Swasth Sampada Smart Business Android application.
 *
 * Firebase Project:
 * swasthsampadasmartbusine-4f4b7
 *
 * Android Package:
 * com.ss.swasthsampadasmartbusiness
 *
 * Web App:
 * Swasth Sampada Smart Business Admin
 *
 * Do NOT use firebase-applet-config.json here because that
 * configuration may point to the AI Studio/provisioned project.
 * ============================================================
 */

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  projectId: string;
  authDomain: string;
  databaseId?: string;
  error?: string;
}


const getFirebaseConfig = () => {
  const env = (import.meta as any).env || {};

  /**
   * ONLY use the Vite Firebase environment variables.
   *
   * This prevents the old AI Studio Firebase project from
   * overriding the correct Swasth Sampada Firebase project.
   */

  const apiKey =
    env.VITE_FIREBASE_API_KEY ||
    "REPLACE_WITH_FIREBASE_WEB_API_KEY";

  const authDomain =
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    "REPLACE_WITH_FIREBASE_AUTH_DOMAIN";

  const projectId =
    env.VITE_FIREBASE_PROJECT_ID ||
    "REPLACE_WITH_FIREBASE_PROJECT_ID";

  const storageBucket =
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    "REPLACE_WITH_FIREBASE_STORAGE_BUCKET";

  const messagingSenderId =
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID";

  const appId =
    env.VITE_FIREBASE_APP_ID ||
    "REPLACE_WITH_FIREBASE_APP_ID";


  /**
   * IMPORTANT:
   *a
   * Do NOT automatically use the AI Studio database ID.
   *
   * If VITE_FIREBASE_DATABASE_ID is not defined,
   * Firebase uses the default Firestore database.
   *
   * This is normally what the Android app uses.
   */
  const firestoreDatabaseId =
    env.VITE_FIREBASE_DATABASE_ID || "(default)";


  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    firestoreDatabaseId,
    isValid: Boolean(apiKey && projectId),
  };
};


/**
 * ============================================================
 * FIREBASE INSTANCES
 * ============================================================
 */

let app: FirebaseApp | null = null;

let auth: Auth | null = null;

let db: Firestore | null = null;

let storage: FirebaseStorage | null = null;


const config = getFirebaseConfig();


/**
 * ============================================================
 * FIREBASE INITIALIZATION
 * ============================================================
 */

try {
  if (config.apiKey && config.projectId) {

    /**
     * Prevent duplicate Firebase initialization
     * during Vite development/HMR.
     */
    if (!getApps().length) {

      app = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });

    } else {

      app = getApp();

    }


    /**
     * Firebase Authentication
     */
    auth = getAuth(app);


    /**
     * ========================================================
     * FIRESTORE
     * ========================================================
     *
     * IMPORTANT:
     * Use the default Firestore database unless you explicitly
     * configured the Android application to use a named database.
     *
     * This prevents the Admin Panel from accidentally connecting
     * to the AI Studio generated database.
     */

    if (
      config.firestoreDatabaseId &&
      config.firestoreDatabaseId !== "(default)"
    ) {

      db = getFirestore(
        app,
        config.firestoreDatabaseId
      );

    } else {

      db = getFirestore(app);

    }


    /**
     * Firebase Storage
     */
    storage = getStorage(app);

  }

} catch (err: any) {

  console.error(
    "Firebase initialization error:",
    err?.message || err
  );

}


/**
 * ============================================================
 * FIREBASE STATUS
 * ============================================================
 */

export const isFirebaseConfigured =
  Boolean(app && db);


export const getFirebaseStatus =
  (): FirebaseConfigStatus => {

    return {

      isConfigured:
        isFirebaseConfigured,

      projectId:
        config.projectId,

      authDomain:
        config.authDomain,

      databaseId:
        config.firestoreDatabaseId,

    };

  };


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

export {
  app,
  auth,
  db,
  storage,
};