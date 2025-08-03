import { Trip, FuelLog, FuelStation, DrivingBehavior, Vehicle, User } from '@/types';
import { db } from '@/services/firebase';
import { SharedDataService } from '../../shared/services/dataService';
import { USER_TYPES, UserType } from '../../shared/config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export class DataService extends SharedDataService {
  constructor() {
    super(db);
  }

  // --- User Management ---
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      return await super.getUserProfile(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // --- Vehicles ---
  async getVehicles(userId: string): Promise<Vehicle[]> {
    if (!userId) {
      console.warn('getVehicles called with undefined userId');
      return [];
    }
    
    try {
      // Get user profile to determine user type
      const userProfile = await this.getUserProfile(userId);
      const userType = userProfile?.type || USER_TYPES.CITIZEN;
      
      return await super.getVehicles(userId, userType as UserType);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  }

  // --- Trips ---
  async getTrips(userId: string): Promise<Trip[]> {
    if (!userId) {
      console.warn('getTrips called with undefined userId');
      return [];
    }
    
    try {
      // Get user profile to determine user type
      const userProfile = await this.getUserProfile(userId);
      const userType = userProfile?.type || USER_TYPES.CITIZEN;
      
      return await super.getTrips(userId, userType as UserType);
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  }

  // --- Fuel Logs ---
  async getFuelLogs(userId: string): Promise<FuelLog[]> {
    if (!userId) {
      console.warn('getFuelLogs called with undefined userId');
      return [];
    }
    
    try {
      // Get user profile to determine user type
      const userProfile = await this.getUserProfile(userId);
      const userType = userProfile?.type || USER_TYPES.CITIZEN;
      
      return await super.getFuelLogs(userId, userType as UserType);
    } catch (error) {
      console.error('Error loading fuel logs:', error);
      return [];
    }
  }

  // --- Driver-specific methods ---
  async getDriverAssignedData(userId: string) {
    return await super.getDriverAssignedData(userId);
  }

  // --- Fuel Stations ---
  async getFuelStations(): Promise<FuelStation[]> {
    try {
      const stationsRef = collection(this.db, 'fuelStations');
      const q = query(stationsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as FuelStation;
      });
    } catch (error) {
      console.error('Error loading fuel stations:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          name: 'Shell Station',
          brand: 'Shell',
          address: 'Main Street, Mbabane',
          location: { latitude: -26.3167, longitude: 31.1333 },
          distance: 0.5,
          prices: { gasoline: 6.80, diesel: 6.75, premium: 7.20 },
          lastUpdated: new Date(),
        },
        {
          id: '2',
          name: 'Total Fuel',
          brand: 'Total',
          address: 'Commercial Street, Mbabane',
          location: { latitude: -26.3200, longitude: 31.1400 },
          distance: 1.2,
          prices: { gasoline: 6.75, diesel: 6.70, premium: 7.15 },
          lastUpdated: new Date(),
        },
        {
          id: '3',
          name: 'Engen Station',
          brand: 'Engen',
          address: 'Industrial Road, Mbabane',
          location: { latitude: -26.3100, longitude: 31.1250 },
          distance: 0.8,
          prices: { gasoline: 6.90, diesel: 6.85, premium: 7.30 },
          lastUpdated: new Date(),
        },
      ];
    }
  }

  // --- Monthly Usage Calculation ---
  async calculateMonthlyUsage(userId: string, month?: number, year?: number): Promise<number> {
    if (!userId) {
      console.warn('calculateMonthlyUsage called with undefined userId');
      return 0;
    }

    try {
      // Get user profile to determine user type
      const userProfile = await this.getUserProfile(userId);
      const userType = userProfile?.type || USER_TYPES.CITIZEN;
      
      return await super.calculateMonthlyUsage(userId, userType as UserType, month, year);
    } catch (error) {
      console.error('Error calculating monthly usage:', error);
      return 0;
    }
  }

  async getMonthlyBudgetStatus(userId: string): Promise<{
    monthlyUsage: number;
    monthlyLimit: number;
    personalBudget: number;
    isBusinessUser: boolean;
    usagePercentage: number;
    remainingBudget: number;
    isOverBudget: boolean;
  }> {
    if (!userId) {
      throw new Error('getMonthlyBudgetStatus called with undefined userId');
    }

    try {
      // Get user profile to determine budget type
      const userProfile = await this.getUserProfile(userId);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return await super.getMonthlyBudgetStatus(userId, userProfile.type as UserType);
    } catch (error) {
      console.error('Error getting monthly budget status:', error);
      throw error;
    }
  }

  // --- Budget Alerts ---
  async getBudgetAlerts(userId: string): Promise<string[]> {
    try {
      // Get user profile to determine user type
      const userProfile = await this.getUserProfile(userId);
      const userType = userProfile?.type || USER_TYPES.CITIZEN;
      
      return await super.getBudgetAlerts(userId, userType as UserType);
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  async updateDrivingBehavior(behavior: DrivingBehavior): Promise<void> {
    try {
      const behaviorRef = doc(this.db, 'drivingBehavior', behavior.userId);
      await setDoc(behaviorRef, {
        ...behavior,
        date: Timestamp.fromDate(behavior.date),
      });
    } catch (error) {
      console.error('Error updating driving behavior:', error);
      throw error;
    }
  }

  // --- Business Users (Drivers) ---
  async getBusinessUserDetails(userId: string): Promise<any> {
    try {
      const businessUserRef = doc(this.db, 'businessUsers', userId);
      const businessUserSnap = await getDoc(businessUserRef);
      
      if (!businessUserSnap.exists()) {
        return null;
      }
      
      const businessData = businessUserSnap.data();
      
      // Get business details if businessId exists
      let businessDetails = null;
      if (businessData.businessId) {
        const businessRef = doc(this.db, 'businesses', businessData.businessId);
        const businessSnap = await getDoc(businessRef);
        if (businessSnap.exists()) {
          businessDetails = businessSnap.data();
        }
      }
      
      return {
        ...businessData,
        business: businessDetails,
      };
    } catch (error) {
      console.error('Error getting business user details:', error);
      return null;
    }
  }

  // --- Drivers Collection ---
  async getDriverDetails(userId: string): Promise<any> {
    try {
      const driverRef = doc(this.db, 'drivers', userId);
      const driverSnap = await getDoc(driverRef);
      
      if (driverSnap.exists()) {
        return driverSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting driver details:', error);
      return null;
    }
  }

  // --- Analytics and Reports ---
  async getFuelEfficiencyTrends(userId: string, days: number = 30): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const tripsRef = collection(this.db, 'trips');
      const q = query(
        tripsRef,
        where('userId', '==', userId),
        where('startTime', '>=', Timestamp.fromDate(startDate)),
        where('startTime', '<=', Timestamp.fromDate(endDate)),
        orderBy('startTime', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.startTime?.toDate() || new Date(),
          efficiency: data.efficiency || 0,
          fuelUsed: data.fuelUsed || 0,
          distance: data.distance || 0,
          cost: data.cost || 0,
        };
      });
    } catch (error) {
      console.error('Error getting fuel efficiency trends:', error);
      return [];
    }
  }

  // Create user profile method for mobile app
  async createUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    const userProfile: User = {
      id: userId,
      name: userData.name || '',
      email: userData.email || '',
      type: userData.type || USER_TYPES.CITIZEN,
      personalBudget: userData.personalBudget || 0,
      createdAt: new Date(),
    };

    const userRef = doc(this.db, 'users', userId);
    await setDoc(userRef, {
      ...userProfile,
      createdAt: Timestamp.fromDate(userProfile.createdAt),
    });

    return userProfile;
  }
}

export const dataService = new DataService();