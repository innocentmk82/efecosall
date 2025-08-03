// Re-export shared types for web app
export * from '../shared/types';

// Web-specific types
export interface WebUser extends User {
  // Web-specific user properties
  lastLoginIP?: string;
  sessionId?: string;
  browserInfo?: string;
}

// Dashboard KPIs interface (web-specific)
export interface DashboardKPIs {
  monthlyFuelUsed: number;
  projectedSpend: number;
  litersSaved: number;
  costSavings: number;
  averageEfficiency: number;
  totalVehicles: number;
  activeTrips: number;
  anomaliesDetected: number;
}

// OBD Data interface (web-specific with additional fields)
export interface OBDData {
  // Engine Data
  engineRPM: number;
  engineLoad: number;
  engineTemperature: number;
  coolantTemperature: number;
  oilTemperature: number;
  oilPressure: number;
  
  // Fuel System
  fuelLevel: number; // Percentage
  fuelConsumption: number; // L/100km
  fuelFlowRate: number; // L/h
  fuelPressure: number; // kPa
  
  // Vehicle Speed & Distance
  vehicleSpeed: number; // km/h
  odometer: number; // km
  tripDistance: number; // km
  
  // Performance Metrics
  throttlePosition: number; // Percentage
  brakePressure: number; // kPa
  acceleration: number; // m/s²
  idleTime: number; // seconds
  
  // Diagnostic Data
  checkEngineLight: boolean;
  diagnosticTroubleCodes: string[];
  emissionStatus: 'pass' | 'fail' | 'pending';
  
  // Battery & Electrical
  batteryVoltage: number; // V
  alternatorVoltage: number; // V
  
  // Transmission
  transmissionTemperature: number;
  gearPosition: number;
  
  // Environmental
  ambientTemperature: number;
  barometricPressure: number;
  
  // Timestamp
  timestamp: string;
  
  // Connection Status
  isConnected: boolean;
  signalStrength: number; // Percentage
  lastUpdate: string;
}

export interface OBDAlert {
  id: string;
  vehicleId: string;
  type: 'warning' | 'error' | 'info';
  category: 'engine' | 'fuel' | 'battery' | 'emission' | 'performance';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  businessId?: string; // Business owner ID
}

export interface OBDDevice {
  id: string;
  deviceId: string;
  vehicleId: string;
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  isConnected: boolean;
  lastSeen: string;
  signalStrength: number;
  batteryLevel: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  businessId?: string; // Business owner ID
}

// Business registration data (web-specific)
export interface BusinessRegistrationData {
  businessName: string;
  businessEmail: string;
  businessType: Business['businessType'];
  registrationNumber: string;
  taxId: string;
  address: Business['address'];
  contactPerson: Business['contactPerson'];
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface BusinessLoginData {
  email: string;
  password: string;
}

export interface BusinessValidationResult {
  isValid: boolean;
  errors: string[];
}