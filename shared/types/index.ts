import { UserType } from '../config/firebase';

// Base User interface
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  createdAt: Date;
  updatedAt?: Date;
}

// Citizen User
export interface CitizenUser extends BaseUser {
  type: 'citizen';
  personalBudget: number;
  preferences?: {
    currency: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

// Driver User
export interface DriverUser extends BaseUser {
  type: 'driver';
  companyId: string;
  companyName: string;
  monthlyFuelLimit: number;
  licenseNumber: string;
  department: string;
  assignedVehicles: string[];
  temporalPassword?: string;
  authUid?: string;
  businessId: string;
  permissions: string[];
  role: string;
  isActive: boolean;
}

// Union type for all users
export type User = CitizenUser | DriverUser;

// Vehicle interface
export interface Vehicle {
  id: string;
  userId?: string; // For citizen vehicles
  businessId?: string; // For business vehicles
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  tankCapacity?: number;
  averageConsumption?: number;
  department?: string;
  status: 'active' | 'maintenance' | 'inactive';
  efficiencyScore: number;
  monthlyBudget?: number;
  currentSpend?: number;
  assignedDriverId?: string;
  obdDeviceId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Trip interface
export interface Trip {
  id: string;
  userId?: string; // For citizen trips
  businessId?: string; // For business trips
  vehicleId: string;
  driverId?: string;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number;
  fuelUsed: number;
  cost: number;
  avgSpeed?: number;
  maxSpeed?: number;
  idleTime?: number;
  efficiency: number;
  status: 'Completed' | 'In Progress' | 'Planned' | 'Cancelled';
  routeOptimization?: 'Optimized' | 'Standard' | 'Manual';
  tag?: string;
  isManual: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Fuel Log interface
export interface FuelLog {
  id: string;
  userId?: string; // For citizen logs
  businessId?: string; // For business logs
  vehicleId: string;
  driverId?: string;
  date: Date;
  station: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  tripDistance?: number;
  efficiency?: number;
  route?: string;
  isAnomalous?: boolean;
  anomalyReason?: string;
  tag?: string;
  receiptImage?: string;
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Budget interface
export interface Budget {
  id: string;
  name: string;
  department: string;
  period: 'monthly' | 'weekly';
  monthlyLimit: number;
  weeklyLimit?: number;
  currentSpend: number;
  vehicleIds: string[];
  driverIds?: string[];
  alertThreshold: number;
  businessId: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Business interface
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
  settings: {
    fuelEfficiencyTarget: number;
    budgetAlertsEnabled: boolean;
    obdMonitoringEnabled: boolean;
    routeOptimizationEnabled: boolean;
    anomalyDetectionEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    timezone: string;
    currency: string;
    language: string;
  };
}

// Fuel Station interface
export interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  prices: {
    gasoline: number;
    diesel: number;
    premium: number;
  };
  lastUpdated: Date;
  amenities?: string[];
  operatingHours?: {
    open: string;
    close: string;
  };
  contactInfo?: {
    phone?: string;
    website?: string;
  };
}

// Driving Behavior interface
export interface DrivingBehavior {
  userId: string;
  date: Date;
  aggressiveAcceleration: number;
  hardBraking: number;
  excessiveIdling: number;
  speedingEvents: number;
  fuelEfficiencyScore: number;
  overallScore: number;
  totalDistance?: number;
  totalDrivingTime?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  ecoScore?: number;
  safetyScore?: number;
}

// OBD Data interface
export interface OBDData {
  timestamp: Date;
  rpm: number;
  speed: number;
  fuelConsumption: number;
  engineLoad: number;
  coolantTemp: number;
  throttlePosition?: number;
  airIntakeTemp?: number;
  fuelPressure?: number;
  engineRunTime?: number;
  vehicleSpeed: number;
  engineRPM: number;
  fuelLevel: number;
  batteryVoltage: number;
  engineTemperature: number;
  odometer: number;
  tripDistance: number;
  isConnected: boolean;
  signalStrength: number;
  lastUpdate: string;
}

// Authentication interfaces
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType?: UserType;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}