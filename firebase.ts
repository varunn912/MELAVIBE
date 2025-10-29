// firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

let app: FirebaseApp | null = null;
export let database: Database | null = null;

function initialize() {
  const configString = localStorage.getItem('firebaseConfig');
  if (configString) {
    try {
      const config = JSON.parse(configString);
      // Basic validation to ensure the config object is not empty or malformed
      if (config.apiKey && config.databaseURL) {
        app = initializeApp(config);
        database = getDatabase(app);
        console.info("Firebase initialized successfully from localStorage config.");
      } else {
         console.warn("Firebase config from localStorage is missing required keys (apiKey, databaseURL).");
         localStorage.removeItem('firebaseConfig'); // Clear bad config
      }
    } catch (error) {
      console.error("Failed to parse or initialize Firebase from localStorage config:", error);
      localStorage.removeItem('firebaseConfig'); // Clear bad config to allow for re-entry
    }
  } else {
    console.info("Firebase config not found in localStorage. App will prompt for setup.");
  }
}

// Attempt to initialize on module load. The App will handle the UI if 'database' remains null.
initialize();
