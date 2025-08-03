export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  plateNumber: string;
  tankCapacity: number;
  averageConsumption: number; // L/100km
  department: string;
  status: 'active' | 'maintenance' | 'inactive';
  efficiencyScore: number;
  efficiencyTarget?: number; // NEW: per-vehicle efficiency target
  monthlyBudget: number;
  currentSpend: number;
  obdDeviceId?: string; // OBD-II device ID for tracking
  assignedDriverId?: string; // Currently assigned driver
  obdData?: OBDData; // Real-time OBD data
  lastOBDUpdate?: string; // Timestamp of last OBD data update
  businessId?: string; // Business owner ID
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  department: string;
  assignedVehicles: string[];
  efficiencyScore: number;
  efficiencyTarget?: number; // NEW: per-driver efficiency target
  totalTrips: number;
  totalDistance: number;
  totalFuelUsed: number;
  joinDate: string;
  obdDeviceId?: string; // OBD-II device ID for tracking
  phoneNumber?: string; // Additional contact info
  emergencyContact?: string; // Emergency contact information
  temporalPassword?: string; // Temporary password for mobile app login
  authUid?: string; // Firebase Authentication UID
  businessId?: string; // Business owner ID
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  odometer: number;
  liters: number;
  cost: number;
  location: string;
  tripDistance: number;
  efficiency: number; // L/100km
  route: string;
  isAnomalous: boolean;
  anomalyReason?: string;
  tag: string; // Trip category (e.g., 'Business', 'Delivery', 'Maintenance')
  businessId?: string; // Business owner ID
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  fuelUsed: number;
  cost: number;
  status: 'Completed' | 'In Progress' | 'Planned' | 'Cancelled';
  routeOptimization: 'Optimized' | 'Standard' | 'Manual';
  tag: string;
  route?: string;
  efficiency?: number;
  predictedFuel?: number;
  actualFuel?: number;
  idleTime?: number;
  averageSpeed?: number;
  businessId?: string; // Business owner ID
}

export interface Budget {
  id: string;
  name: string;
  department: string;
  period: 'monthly' | 'weekly'; // NEW: period type
  monthlyLimit: number;
  weeklyLimit?: number; // NEW: optional weekly limit
  currentSpend: number;
  vehicleIds: string[];
  driverIds?: string[]; // NEW: optional driver assignment
  alertThreshold: number; // percentage
  businessId?: string; // Business owner ID
}

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

export interface Business {
  id: string;
  name: string;
  email: string;
  businessType: 'transportation' | 'delivery' | 'logistics' | 'construction' | 'agriculture' | 'other';
  registrationNumber: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndDate?: string;
  subscriptionEndDate?: string;
  maxVehicles: number;
  maxDrivers: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  verificationDocuments?: string[];
  settings: BusinessSettings;
}

export interface BusinessSettings {
  fuelEfficiencyTarget: number; // L/100km
  budgetAlertsEnabled: boolean;
  obdMonitoringEnabled: boolean;
  routeOptimizationEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  timezone: string;
  currency: string;
  language: string;
}

export interface BusinessUser {
  id: string;
  businessId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'driver';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

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