import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { COLLECTIONS, UserType, USER_TYPES } from '../config/firebase';
import { User, Vehicle, Trip, FuelLog, Budget, DrivingBehavior } from '../types';

export class SharedDataService {
  protected db: any;

  constructor(db: any) {
    this.db = db;
  }

  // --- User Management ---
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // First check if user is a business user (driver)
      const businessUserRef = doc(this.db, COLLECTIONS.BUSINESS_USERS, userId);
      const businessUserSnap = await getDoc(businessUserRef);
      
      if (businessUserSnap.exists()) {
        const businessData = businessUserSnap.data();
        
        // Get business details
        let businessName = '';
        if (businessData.businessId) {
          const businessRef = doc(this.db, COLLECTIONS.BUSINESSES, businessData.businessId);
          const businessSnap = await getDoc(businessRef);
          if (businessSnap.exists()) {
            businessName = businessSnap.data().name || '';
          }
        }
        
        return {
          id: userId,
          name: businessData.email?.split('@')[0] || 'Driver',
          email: businessData.email || '',
          type: USER_TYPES.DRIVER,
          companyId: businessData.businessId,
          companyName: businessName,
          monthlyFuelLimit: businessData.monthlyFuelLimit || 0,
          businessId: businessData.businessId,
          permissions: businessData.permissions || [],
          role: businessData.role || 'driver',
          isActive: businessData.isActive !== false,
          createdAt: businessData.createdAt?.toDate() || new Date(),
          licenseNumber: '',
          department: '',
          assignedVehicles: [],
        } as User;
      }
      
      // Check drivers collection for temporal password users
      const driversRef = collection(this.db, COLLECTIONS.DRIVERS);
      const driverQuery = query(driversRef, where('authUid', '==', userId));
      const driverSnapshot = await getDocs(driverQuery);
      
      if (!driverSnapshot.empty) {
        const driverData = driverSnapshot.docs[0].data();
        
        // Get business details if businessId exists
        let businessName = '';
        if (driverData.businessId) {
          const businessRef = doc(this.db, COLLECTIONS.BUSINESSES, driverData.businessId);
          const businessSnap = await getDoc(businessRef);
          if (businessSnap.exists()) {
            businessName = businessSnap.data().name || '';
          }
        }
        
        return {
          id: userId,
          name: driverData.name || 'Driver',
          email: driverData.email || '',
          type: USER_TYPES.DRIVER,
          companyId: driverData.businessId,
          companyName: businessName,
          monthlyFuelLimit: driverData.monthlyFuelLimit || 0,
          businessId: driverData.businessId,
          licenseNumber: driverData.licenseNumber || '',
          department: driverData.department || '',
          assignedVehicles: driverData.assignedVehicles || [],
          permissions: [],
          role: 'driver',
          isActive: true,
          createdAt: driverData.createdAt?.toDate() || new Date(),
        } as User;
      }
      
      // Check regular users collection
      const userRef = doc(this.db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        return {
          id: userId,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          type: userData.type || USER_TYPES.CITIZEN,
          personalBudget: userData.personalBudget || 0,
          preferences: userData.preferences || {
            currency: 'E',
            notifications: true,
            theme: 'light'
          },
          createdAt: userData.createdAt?.toDate() || new Date(),
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // --- Vehicles ---
  async getVehicles(userId: string, userType: UserType): Promise<Vehicle[]> {
    if (!userId) {
      console.warn('getVehicles called with undefined userId');
      return [];
    }
    
    try {
      const vehiclesRef = collection(this.db, COLLECTIONS.VEHICLES);
      let q;
      
      if (userType === USER_TYPES.DRIVER) {
        // For drivers, get vehicles assigned to them or their business
        const userProfile = await this.getUserProfile(userId);
        if (userProfile && 'businessId' in userProfile && userProfile.businessId) {
          q = query(vehiclesRef, where('businessId', '==', userProfile.businessId));
        } else {
          q = query(vehiclesRef, where('assignedDriverId', '==', userId));
        }
      } else {
        // For citizens, get their personal vehicles
        q = query(vehiclesRef, where('userId', '==', userId));
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Vehicle;
      });
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  }

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    try {
      const vehiclesRef = collection(this.db, COLLECTIONS.VEHICLES);
      const docRef = await addDoc(vehiclesRef, {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { ...vehicle, id: docRef.id } as Vehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      const vehicleRef = doc(this.db, COLLECTIONS.VEHICLES, vehicleId);
      await updateDoc(vehicleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(this.db, COLLECTIONS.VEHICLES, vehicleId);
      await deleteDoc(vehicleRef);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  async setActiveVehicle(userId: string, vehicleId: string): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      // First, deactivate all vehicles for this user
      const vehiclesRef = collection(this.db, COLLECTIONS.VEHICLES);
      const q = query(vehiclesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });
      
      // Then activate the selected vehicle
      const vehicleRef = doc(this.db, COLLECTIONS.VEHICLES, vehicleId);
      batch.update(vehicleRef, { isActive: true });
      
      await batch.commit();
    } catch (error) {
      console.error('Error setting active vehicle:', error);
      throw error;
    }
  }

  // --- Trips ---
  async getTrips(userId: string, userType: UserType): Promise<Trip[]> {
    if (!userId) {
      console.warn('getTrips called with undefined userId');
      return [];
    }
    
    try {
      const tripsRef = collection(this.db, COLLECTIONS.TRIPS);
      let q;
      
      if (userType === USER_TYPES.DRIVER) {
        // For drivers, get trips assigned to them or their business
        const userProfile = await this.getUserProfile(userId);
        if (userProfile && 'businessId' in userProfile && userProfile.businessId) {
          q = query(
            tripsRef, 
            where('businessId', '==', userProfile.businessId),
            where('driverId', '==', userId),
            orderBy('startTime', 'desc'),
            limit(50)
          );
        } else {
          q = query(
            tripsRef, 
            where('driverId', '==', userId),
            orderBy('startTime', 'desc'),
            limit(50)
          );
        }
      } else {
        // For citizens, get their personal trips
        q = query(
          tripsRef, 
          where('userId', '==', userId),
          orderBy('startTime', 'desc'),
          limit(50)
        );
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startTime: data.startTime?.toDate() || new Date(data.startTime),
          endTime: data.endTime?.toDate() || (data.endTime ? new Date(data.endTime) : undefined),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Trip;
      });
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  }

  async addTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
    try {
      const tripsRef = collection(this.db, COLLECTIONS.TRIPS);
      const tripToSave = {
        ...trip,
        startTime: Timestamp.fromDate(trip.startTime),
        endTime: trip.endTime ? Timestamp.fromDate(trip.endTime) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(tripsRef, tripToSave);
      return { ...trip, id: docRef.id } as Trip;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  }

  // --- Fuel Logs ---
  async getFuelLogs(userId: string, userType: UserType): Promise<FuelLog[]> {
    if (!userId) {
      console.warn('getFuelLogs called with undefined userId');
      return [];
    }
    
    try {
      const logsRef = collection(this.db, COLLECTIONS.FUEL_LOGS);
      let q;
      
      if (userType === USER_TYPES.DRIVER) {
        // For drivers, get fuel logs for their business or assigned to them
        const userProfile = await this.getUserProfile(userId);
        if (userProfile && 'businessId' in userProfile && userProfile.businessId) {
          q = query(
            logsRef, 
            where('businessId', '==', userProfile.businessId),
            orderBy('date', 'desc'),
            limit(50)
          );
        } else {
          q = query(
            logsRef, 
            where('driverId', '==', userId),
            orderBy('date', 'desc'),
            limit(50)
          );
        }
      } else {
        // For citizens, get their personal fuel logs
        q = query(
          logsRef, 
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(50)
        );
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate() || new Date(data.date),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as FuelLog;
      });
    } catch (error) {
      console.error('Error loading fuel logs:', error);
      return [];
    }
  }

  async addFuelLog(log: Omit<FuelLog, 'id'>): Promise<FuelLog> {
    try {
      const logsRef = collection(this.db, COLLECTIONS.FUEL_LOGS);
      const logToSave = {
        ...log,
        date: Timestamp.fromDate(log.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(logsRef, logToSave);
      return { ...log, id: docRef.id } as FuelLog;
    } catch (error) {
      console.error('Error adding fuel log:', error);
      throw error;
    }
  }

  // --- Budget Management ---
  async getBudgets(userId: string, userType: UserType): Promise<Budget[]> {
    if (!userId) {
      console.warn('getBudgets called with undefined userId');
      return [];
    }
    
    try {
      const budgetsRef = collection(this.db, COLLECTIONS.BUDGETS);
      let q;
      
      if (userType === USER_TYPES.DRIVER) {
        // For drivers, get budgets for their business
        const userProfile = await this.getUserProfile(userId);
        if (userProfile && 'businessId' in userProfile && userProfile.businessId) {
          q = query(budgetsRef, where('businessId', '==', userProfile.businessId));
        } else {
          return [];
        }
      } else {
        // For citizens, they don't have business budgets
        return [];
      }
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Budget[];
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  }

  // --- Monthly Usage Calculation ---
  async calculateMonthlyUsage(userId: string, userType: UserType, month?: number, year?: number): Promise<number> {
    if (!userId) {
      console.warn('calculateMonthlyUsage called with undefined userId');
      return 0;
    }

    try {
      const currentDate = new Date();
      const targetMonth = month ?? currentDate.getMonth();
      const targetYear = year ?? currentDate.getFullYear();

      // Get start and end of month
      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

      // Query trips for the month based on user type
      const tripsRef = collection(this.db, COLLECTIONS.TRIPS);
      let q;
      
      if (userType === USER_TYPES.DRIVER) {
        const userProfile = await this.getUserProfile(userId);
        if (userProfile && 'businessId' in userProfile && userProfile.businessId) {
          q = query(
            tripsRef,
            where('businessId', '==', userProfile.businessId),
            where('driverId', '==', userId),
            where('startTime', '>=', Timestamp.fromDate(startOfMonth)),
            where('startTime', '<=', Timestamp.fromDate(endOfMonth))
          );
        } else {
          q = query(
            tripsRef,
            where('driverId', '==', userId),
            where('startTime', '>=', Timestamp.fromDate(startOfMonth)),
            where('startTime', '<=', Timestamp.fromDate(endOfMonth))
          );
        }
      } else {
        q = query(
          tripsRef,
          where('userId', '==', userId),
          where('startTime', '>=', Timestamp.fromDate(startOfMonth)),
          where('startTime', '<=', Timestamp.fromDate(endOfMonth))
        );
      }
      
      const snapshot = await getDocs(q);
      
      // Calculate total cost from trips
      const totalCost = snapshot.docs.reduce((sum, doc) => {
        const trip = doc.data();
        return sum + (trip.cost || 0);
      }, 0);
      
      return totalCost;
    } catch (error) {
      console.error('Error calculating monthly usage:', error);
      return 0;
    }
  }

  // --- Driver-specific data fetching ---
  async getDriverAssignedData(userId: string): Promise<{
    vehicles: Vehicle[];
    budgets: Budget[];
    monthlyLimit: number;
  }> {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      if (!userProfile || userProfile.type !== USER_TYPES.DRIVER) {
        return { vehicles: [], budgets: [], monthlyLimit: 0 };
      }

      // Get assigned vehicles
      const vehiclesRef = collection(this.db, COLLECTIONS.VEHICLES);
      let vehicleQuery;
      
      if ('businessId' in userProfile && userProfile.businessId) {
        vehicleQuery = query(vehiclesRef, where('businessId', '==', userProfile.businessId));
      } else {
        vehicleQuery = query(vehiclesRef, where('assignedDriverId', '==', userId));
      }
      
      const vehicleSnapshot = await getDocs(vehicleQuery);
      const vehicles = vehicleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Vehicle[];

      // Get budgets
      const budgets = await this.getBudgets(userId, USER_TYPES.DRIVER);

      return {
        vehicles,
        budgets,
        monthlyLimit: 'monthlyFuelLimit' in userProfile ? userProfile.monthlyFuelLimit || 0 : 0
      };
    } catch (error) {
      console.error('Error getting driver assigned data:', error);
      return { vehicles: [], budgets: [], monthlyLimit: 0 };
    }
  }

  // --- Driving Behavior ---
  async getDrivingBehavior(userId: string): Promise<DrivingBehavior | null> {
    if (!userId) {
      console.warn('getDrivingBehavior called with undefined userId');
      return null;
    }
    
    try {
      const behaviorRef = doc(this.db, 'drivingBehavior', userId);
      const snap = await getDoc(behaviorRef);
      
      if (snap.exists()) {
        const data = snap.data();
        return {
          ...data,
          date: data.date?.toDate() || new Date(),
        } as DrivingBehavior;
      }
      
      // Return default behavior if none exists
      return {
        userId,
        date: new Date(),
        aggressiveAcceleration: 0,
        hardBraking: 0,
        excessiveIdling: 0,
        speedingEvents: 0,
        fuelEfficiencyScore: 100,
        overallScore: 100,
      };
    } catch (error) {
      console.error('Error loading driving behavior:', error);
      return null;
    }
  }

  // --- Budget Alerts ---
  async getBudgetAlerts(userId: string, userType: UserType): Promise<string[]> {
    try {
      const budgetStatus = await this.getMonthlyBudgetStatus(userId, userType);
      const alerts: string[] = [];

      if (budgetStatus.isOverBudget) {
        alerts.push(`Budget exceeded by E${Math.abs(budgetStatus.remainingBudget).toFixed(2)}`);
      } else if (budgetStatus.usagePercentage >= 90) {
        alerts.push(`Budget at ${budgetStatus.usagePercentage.toFixed(0)}% - nearly exceeded`);
      } else if (budgetStatus.usagePercentage >= 75) {
        alerts.push(`Budget at ${budgetStatus.usagePercentage.toFixed(0)}% - monitor spending`);
      }

      return alerts;
    } catch (error) {
      console.error('Error getting budget alerts:', error);
      return [];
    }
  }

  async getMonthlyBudgetStatus(userId: string, userType: UserType): Promise<{
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

      const isBusinessUser = userProfile.type === USER_TYPES.DRIVER;
      const monthlyLimit = 'monthlyFuelLimit' in userProfile ? userProfile.monthlyFuelLimit || 0 : 0;
      const personalBudget = 'personalBudget' in userProfile ? userProfile.personalBudget || 0 : 0;
      
      // Calculate current month's usage
      const monthlyUsage = await this.calculateMonthlyUsage(userId, userType);
      
      const budgetLimit = isBusinessUser ? monthlyLimit : personalBudget;
      const usagePercentage = budgetLimit > 0 ? (monthlyUsage / budgetLimit) * 100 : 0;
      const remainingBudget = budgetLimit - monthlyUsage;
      const isOverBudget = monthlyUsage > budgetLimit;

      return {
        monthlyUsage,
        monthlyLimit,
        personalBudget,
        isBusinessUser,
        usagePercentage,
        remainingBudget,
        isOverBudget,
      };
    } catch (error) {
      console.error('Error getting monthly budget status:', error);
      throw error;
    }
  }

  // --- User Profile & Budget Updates ---
  async updateUserBudget(userId: string, budget: number): Promise<void> {
    if (!userId) {
      throw new Error('updateUserBudget called with undefined userId');
    }
    
    try {
      const userRef = doc(this.db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, { 
        personalBudget: budget,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user budget:', error);
      throw error;
    }
  }

  async updateUserMonthlyLimit(userId: string, limit: number): Promise<void> {
    if (!userId) {
      throw new Error('updateUserMonthlyLimit called with undefined userId');
    }
    
    try {
      const businessUserRef = doc(this.db, COLLECTIONS.BUSINESS_USERS, userId);
      await updateDoc(businessUserRef, { 
        monthlyFuelLimit: limit,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating monthly limit:', error);
      throw error;
    }
  }

  // --- Sync with Web App ---
  async syncUserData(userId: string): Promise<void> {
    try {
      // This method ensures data consistency between web and mobile
      // Force refresh of user profile and related data
      await this.getUserProfile(userId);
    } catch (error) {
      console.error('Error syncing user data:', error);
      throw error;
    }
  }
}