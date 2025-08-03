export const APP_CONFIG = {
  name: 'E-FECOS',
  fullName: 'Eswatini Fuel Efficiency and Cost Saving System',
  version: '1.0.0',
  description: 'Advanced fleet fuel optimization and management system',
  supportEmail: 'support@efecos.com',
  website: 'https://efecos.com'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  FUEL_LOGS: '/fuel-logs',
  TRIPS: '/trips',
  ANALYTICS: '/analytics',
  BUDGETS: '/budgets',
  ROUTES: '/routes',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  SUBSCRIPTION_EXPIRED: '/subscription-expired'
};

export const DEPARTMENTS = [
  'Operations',
  'Sales',
  'Maintenance',
  'Delivery'
] as const;

export const VEHICLE_STATUSES = [
  'active',
  'maintenance',
  'inactive'
] as const;

export const TRIP_STATUSES = [
  'Completed',
  'In Progress',
  'Planned',
  'Cancelled'
] as const;

export const TRIP_TAGS = [
  'Business',
  'Delivery',
  'Maintenance',
  'Other'
] as const;

export const FUEL_STATIONS = [
  'TotalEnergies Mbabane',
  'Engen Manzini',
  'Shell Ezulwini',
  'Galp Nhlangano',
  'Chevron Industrial Park'
] as const;

export const DEFAULT_FUEL_PRICE = 1.50; // Per liter in Emalangeni
export const DEFAULT_EFFICIENCY_TARGET = 8.5; // L/100km
export const DEFAULT_BUDGET_ALERT_THRESHOLD = 80; // Percentage

export const OBD_ALERT_TYPES = [
  'warning',
  'error',
  'info'
] as const;

export const OBD_ALERT_CATEGORIES = [
  'engine',
  'fuel',
  'battery',
  'emission',
  'performance'
] as const;

export const OBD_ALERT_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical'
] as const;