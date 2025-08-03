// Shared Firebase configuration for both web and mobile apps
export const firebaseConfig = {
  apiKey: "AIzaSyDPOA1FlioFWIXcw4NCQA8O72gynjj2KBs",
  authDomain: "efecos-538f7.firebaseapp.com",
  projectId: "efecos-538f7",
  storageBucket: "efecos-538f7.firebasestorage.app",
  messagingSenderId: "649177228733",
  appId: "1:649177228733:web:cfb3a1a9cd51ed4ad65ed4",
  measurementId: "G-FC0V6E8D1B"
};

// Environment configuration
export const ENV_CONFIG = {
  FIREBASE_PROJECT_ID: "efecos-538f7",
  FIREBASE_AUTH_DOMAIN: "efecos-538f7.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET: "efecos-538f7.firebasestorage.app",
  API_BASE_URL: "https://efecos-538f7.firebaseapp.com",
  APP_VERSION: "1.0.0",
  ENVIRONMENT: "production"
};

// User types and roles
export const USER_TYPES = {
  CITIZEN: 'citizen',
  DRIVER: 'driver',
  ADMIN: 'admin'
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  FUEL_LOGS: 'fuelLogs',
  TRIPS: 'trips',
  BUDGETS: 'budgets',
  BUSINESSES: 'businesses',
  BUSINESS_USERS: 'businessUsers',
  OBD_DEVICES: 'obdDevices',
  OBD_ALERTS: 'obdAlerts'
} as const;