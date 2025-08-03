// Re-export shared types
export * from '../shared/types';

// Mobile-specific types
export interface MobileUser extends User {
  // Mobile-specific user properties
  deviceId?: string;
  pushToken?: string;
  lastLoginDevice?: string;
  appVersion?: string;
}

export interface MobileVehicle extends Vehicle {
  // Mobile-specific vehicle properties
  lastSyncTime?: Date;
  offlineData?: any;
}

export interface MobileTrip extends Trip {
  // Mobile-specific trip properties
  syncStatus?: 'synced' | 'pending' | 'failed';
  offlineMode?: boolean;
}

// Form types for mobile
export interface MobileLoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface MobileSignUpForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface MobileVehicleForm {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: Vehicle['fuelType'];
}

export interface MobileTripForm {
  startLocation: string;
  endLocation: string;
  distance: number;
  fuelUsed: number;
  cost: number;
  purpose?: string;
}

export interface MobileFuelLogForm {
  station: string;
  liters: number;
  pricePerLiter: number;
  odometer: number;
  receiptImage?: string;
  location: string;
}

// Navigation types
export interface NavigationParams {
  [key: string]: any;
}

// Component props types
export interface ScreenProps {
  navigation?: any;
  route?: any;
}