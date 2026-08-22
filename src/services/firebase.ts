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
 * Firebase Project:
 * swasthsampadasmartbusine-4f4b7
 *
 * This Admin Panel uses the SAME Firebase project as:
 * Swasth Sampada Smart Business Android App
 *
 * Firestore:
 * Default database
 *
 * IMPORTANT:
 * Firebase values are read from Vite environment variables.
 *
 * Local:
 * .env
 *
 * GitHub Actions:
 * GitHub Repository Secrets
 * ============================================================
 */

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  projectId: string;
  authDomain: string;
  databaseId: string;
  error?: string;
}

/**
 * ============================================================
 * READ ENVIRONMENT VARIABLES
 * ============================================================
 */

const env = import.meta.env;

/**
 * Firebase Web Configuration
 *
 * These MUST be defined in:
 *
 * .env
 *
 * and in GitHub Actions:
 *
 * VITE_FIREBASE_API_KEY
 * VITE_FIREBASE_AUTH_DOMAIN
 * VITE_FIREBASE_PROJECT_ID
 * VITE_FIREBASE_STORAGE_BUCKET
 * VITE_FIREBASE_MESSAGING_SENDER_ID
 * VITE_FIREBASE_APP_ID
 */

const apiKey = env.VITE_FIREBASE_API_KEY || "";
const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || "";
const projectId = env.VITE_FIREBASE_PROJECT_ID || "";
const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || "";
const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || "";
const appId = env.VITE_FIREBASE_APP_ID || "";

/**
 * Firestore database.
 *
 * If VITE_FIREBASE_DATABASE_ID is not defined,
 * Firebase uses the default Firestore database.
 */

const firestoreDatabaseId =
  env.VITE_FIREBASE_DATABASE_ID || "(default)";

/**
 * ============================================================
 * VALIDATE CONFIGURATION
 * ============================================================
 */

const missingVariables: string[] = [];

if (!apiKey) {
  missingVariables.push("VITE_FIREBASE_API_KEY");
}

if (!authDomain) {
  missingVariables.push("VITE_FIREBASE_AUTH_DOMAIN");
}

if (!projectId) {
  missingVariables.push("VITE_FIREBASE_PROJECT_ID");
}

if (!storageBucket) {
  missingVariables.push("VITE_FIREBASE_STORAGE_BUCKET");
}

if (!messagingSenderId) {
  missingVariables.push("VITE_FIREBASE_MESSAGING_SENDER_ID");
}

if (!appId) {
  missingVariables.push("VITE_FIREBASE_APP_ID");
}

const isConfigValid = missingVariables.length === 0;

/**
 * ============================================================
 * FIREBASE INSTANCES
 * ============================================================
 */

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

/**
 * ============================================================
 * FIREBASE INITIALIZATION
 * ============================================================
 */

if (!isConfigValid) {
  console.error(
    "Firebase configuration is incomplete.",
    {
      missingVariables,
    }
  );
} else {
  try {
    /**
     * Firebase App
     *
     * Prevent duplicate initialization during
     * Vite development/HMR.
     */

    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp({
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      });
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
     * Default database:
     *
     * (default)
     *
     * This should be the same database used by the
     * Swasth Sampada Smart Business Android application.
     */

    if (
      firestoreDatabaseId &&
      firestoreDatabaseId !== "(default)"
    ) {
      db = getFirestore(
        app,
        firestoreDatabaseId
      );
    } else {
      db = getFirestore(app);
    }

    /**
     * Firebase Storage
     */

    storage = getStorage(app);

    console.log(
      "Firebase initialized successfully."
    );

    console.log(
      "Firebase Project:",
      projectId
    );

    console.log(
      "Firestore Database:",
      firestoreDatabaseId
    );

  } catch (error: unknown) {
    console.error(
      "Firebase initialization error:",
      error
    );

    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

/**
 * ============================================================
 * FIREBASE STATUS
 * ============================================================
 */

export const isFirebaseConfigured =
  Boolean(
    app &&
    auth &&
    db &&
    storage
  );

/**
 * ============================================================
 * GET FIREBASE STATUS
 * ============================================================
 */

export const getFirebaseStatus =
  (): FirebaseConfigStatus => {

    return {
      isConfigured:
        isFirebaseConfigured,

      projectId:
        projectId || "",

      authDomain:
        authDomain || "",

      databaseId:
        firestoreDatabaseId,

      ...(missingVariables.length > 0
        ? {
            error:
              `Missing Firebase environment variables: ${missingVariables.join(
                ", "
              )}`,
          }
        : {}),
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