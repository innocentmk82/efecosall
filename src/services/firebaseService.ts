// Firebase service layer for Fuel Optimization System
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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Vehicle, Driver, FuelLog, Budget, Trip, DashboardKPIs, OBDData, OBDAlert, OBDDevice } from '../types';
import { withErrorHandling } from '../utils/errorHandling';

export class FirebaseService {
  // Vehicle operations
  getVehicles = withErrorHandling(async (): Promise<Vehicle[]> => {
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const snapshot = await getDocs(vehiclesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        lastOBDUpdate: doc.data().lastOBDUpdate?.toDate?.()?.toISOString() || doc.data().lastOBDUpdate
      })) as Vehicle[];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }
  });

  addVehicle = withErrorHandling(async (vehicle: Omit<Vehicle, 'id'>): Promise<string> => {
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const docRef = await addDoc(vehiclesRef, {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw new Error('Failed to add vehicle');
    }
  });

  updateVehicle = withErrorHandling(async (id: string, vehicle: Partial<Vehicle>): Promise<void> => {
    try {
      const vehicleRef = doc(db, 'vehicles', id);
      await updateDoc(vehicleRef, {
        ...vehicle,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  });

  deleteVehicle = withErrorHandling(async (id: string): Promise<void> => {
    try {
      const vehicleRef = doc(db, 'vehicles', id);
      await deleteDoc(vehicleRef);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  });

  // Driver operations
  getDrivers = withErrorHandling(async (): Promise<Driver[]> => {
    try {
      const driversRef = collection(db, 'drivers');
      const snapshot = await getDocs(driversRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw new Error('Failed to fetch drivers');
    }
  });

  addDriver = withErrorHandling(async (driver: Omit<Driver, 'id'>): Promise<string> => {
    try {
      // Generate a temporal password for mobile app login
      const temporalPassword = this.generateTemporalPassword();
      
      // Create driver document without creating Firebase Auth user
      const driversRef = collection(db, 'drivers');
      const driverData = {
        ...driver,
        temporalPassword,
        authUid: null, // No Firebase Auth UID since we're not creating Auth user
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const driverDocRef = await addDoc(driversRef, driverData);
      
      // Create corresponding user document for mobile app authentication
      const usersRef = collection(db, 'users');
      const userData = {
        id: driverDocRef.id, // Use the same ID as driver for consistency
        name: driver.name,
        email: driver.email,
        type: 'driver', // User type for mobile app
        temporalPassword,
        authUid: null, // No Firebase Auth UID since we're not creating Auth user
        personalBudget: 0, // Default budget for drivers
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(usersRef, userData);
      
      return driverDocRef.id;
    } catch (error: any) {
      console.error('Error adding driver:', error);
      throw new Error('Failed to add driver. Please try again.');
    }
  });

  // Helper method to generate temporal password
  private generateTemporalPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Regenerate temporal password for existing driver
  regenerateTemporalPassword = withErrorHandling(async (driverId: string): Promise<string> => {
    try {
      const newPassword = this.generateTemporalPassword();
      
      // Get the driver document to find the authUid
      const driverRef = doc(db, 'drivers', driverId);
      const driverDoc = await getDoc(driverRef);
      
      if (!driverDoc.exists()) {
        throw new Error('Driver not found');
      }
      
      // Update driver document
      await updateDoc(driverRef, {
        temporalPassword: newPassword,
        updatedAt: serverTimestamp()
      });
      
      // Update corresponding user document
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', driverId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          temporalPassword: newPassword,
          updatedAt: serverTimestamp()
        });
      }
      
      return newPassword;
    } catch (error) {
      console.error('Error regenerating temporal password:', error);
      throw new Error('Failed to regenerate temporal password');
    }
  });

  updateDriver = withErrorHandling(async (id: string, driver: Partial<Driver>): Promise<void> => {
    try {
      const driverRef = doc(db, 'drivers', id);
      await updateDoc(driverRef, {
        ...driver,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      throw new Error('Failed to update driver');
    }
  });

  deleteDriver = withErrorHandling(async (id: string): Promise<void> => {
    try {
      // Delete driver document
      const driverRef = doc(db, 'drivers', id);
      await deleteDoc(driverRef);
      
      // Also delete the corresponding user document for mobile app
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('id', '==', id));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await deleteDoc(userDoc.ref);
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw new Error('Failed to delete driver');
    }
  });

  // Fuel Log operations
  getFuelLogs = withErrorHandling(async (): Promise<FuelLog[]> => {
    try {
      const fuelLogsRef = collection(db, 'fuelLogs');
      const q = query(fuelLogsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FuelLog[];
    } catch (error) {
      console.error('Error fetching fuel logs:', error);
      throw new Error('Failed to fetch fuel logs');
    }
  });

  addFuelLog = withErrorHandling(async (fuelLog: Omit<FuelLog, 'id'>): Promise<string> => {
    try {
      const fuelLogsRef = collection(db, 'fuelLogs');
      const docRef = await addDoc(fuelLogsRef, {
        ...fuelLog,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding fuel log:', error);
      throw new Error('Failed to add fuel log');
    }
  });

  updateFuelLog = withErrorHandling(async (id: string, fuelLog: Partial<FuelLog>): Promise<void> => {
    try {
      const fuelLogRef = doc(db, 'fuelLogs', id);
      await updateDoc(fuelLogRef, {
        ...fuelLog,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating fuel log:', error);
      throw new Error('Failed to update fuel log');
    }
  });

  deleteFuelLog = withErrorHandling(async (id: string): Promise<void> => {
    try {
      const fuelLogRef = doc(db, 'fuelLogs', id);
      await deleteDoc(fuelLogRef);
    } catch (error) {
      console.error('Error deleting fuel log:', error);
      throw new Error('Failed to delete fuel log');
    }
  });

  // Budget operations
  getBudgets = withErrorHandling(async (): Promise<Budget[]> => {
    try {
      const budgetsRef = collection(db, 'budgets');
      const snapshot = await getDocs(budgetsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw new Error('Failed to fetch budgets');
    }
  });

  addBudget = withErrorHandling(async (budget: Omit<Budget, 'id'>): Promise<string> => {
    try {
      const budgetsRef = collection(db, 'budgets');
      const docRef = await addDoc(budgetsRef, {
        ...budget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding budget:', error);
      throw new Error('Failed to add budget');
    }
  });

  updateBudget = withErrorHandling(async (id: string, budget: Partial<Budget>): Promise<void> => {
    try {
      const budgetRef = doc(db, 'budgets', id);
      await updateDoc(budgetRef, {
        ...budget,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      throw new Error('Failed to update budget');
    }
  });

  deleteBudget = withErrorHandling(async (id: string): Promise<void> => {
    try {
      const budgetRef = doc(db, 'budgets', id);
      await deleteDoc(budgetRef);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Failed to delete budget');
    }
  });

  // Trip operations
  getTrips = withErrorHandling(async (): Promise<Trip[]> => {
    try {
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef, orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        startTime: doc.data().startTime?.toDate?.()?.toISOString() || doc.data().startTime,
        endTime: doc.data().endTime?.toDate?.()?.toISOString() || doc.data().endTime
      })) as Trip[];
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw new Error('Failed to fetch trips');
    }
  });

  addTrip = withErrorHandling(async (trip: Omit<Trip, 'id'>): Promise<string> => {
    try {
      const tripsRef = collection(db, 'trips');
      const docRef = await addDoc(tripsRef, {
        ...trip,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw new Error('Failed to add trip');
    }
  });

  updateTrip = withErrorHandling(async (id: string, trip: Partial<Trip>): Promise<void> => {
    try {
      const tripRef = doc(db, 'trips', id);
      await updateDoc(tripRef, {
        ...trip,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error('Failed to update trip');
    }
  });

  deleteTrip = withErrorHandling(async (id: string): Promise<void> => {
    try {
      const tripRef = doc(db, 'trips', id);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error('Failed to delete trip');
    }
  });

  // OBD Device operations
  async getOBDDevices(): Promise<OBDDevice[]> {
    try {
      const obdDevicesRef = collection(db, 'obdDevices');
      const snapshot = await getDocs(obdDevicesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastSeen: doc.data().lastSeen?.toDate?.()?.toISOString() || doc.data().lastSeen
      })) as OBDDevice[];
    } catch (error) {
      console.error('Error fetching OBD devices:', error);
      throw new Error('Failed to fetch OBD devices');
    }
  }

  async addOBDDevice(device: Omit<OBDDevice, 'id'>): Promise<string> {
    try {
      const obdDevicesRef = collection(db, 'obdDevices');
      const docRef = await addDoc(obdDevicesRef, {
        ...device,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding OBD device:', error);
      throw new Error('Failed to add OBD device');
    }
  }

  async updateOBDDevice(id: string, device: Partial<OBDDevice>): Promise<void> {
    try {
      const deviceRef = doc(db, 'obdDevices', id);
      await updateDoc(deviceRef, {
        ...device,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating OBD device:', error);
      throw new Error('Failed to update OBD device');
    }
  }

  // OBD Alert operations
  async getOBDAlerts(): Promise<OBDAlert[]> {
    try {
      const obdAlertsRef = collection(db, 'obdAlerts');
      const q = query(obdAlertsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
      })) as OBDAlert[];
    } catch (error) {
      console.error('Error fetching OBD alerts:', error);
      throw new Error('Failed to fetch OBD alerts');
    }
  }

  async addOBDAlert(alert: Omit<OBDAlert, 'id'>): Promise<string> {
    try {
      const obdAlertsRef = collection(db, 'obdAlerts');
      const docRef = await addDoc(obdAlertsRef, {
        ...alert,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding OBD alert:', error);
      throw new Error('Failed to add OBD alert');
    }
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      // This would typically involve aggregating data from multiple collections
      // For now, we'll return a basic structure
      const vehicles = await this.getVehicles();
      const fuelLogs = await this.getFuelLogs();
      const trips = await this.getTrips();

      const monthlyFuelUsed = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const totalVehicles = vehicles.length;
      const activeTrips = trips.filter(trip => trip.status === 'In Progress').length;
      const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const averageEfficiency = vehicles.length > 0 
        ? vehicles.reduce((sum, v) => sum + v.efficiencyScore, 0) / vehicles.length 
        : 0;

      return {
        monthlyFuelUsed,
        projectedSpend: totalCost * 1.2,
        litersSaved: Math.max(0, monthlyFuelUsed * 0.15),
        costSavings: Math.max(0, totalCost * 0.12),
        averageEfficiency,
        totalVehicles,
        activeTrips,
        anomaliesDetected: fuelLogs.filter(log => log.isAnomalous).length
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw new Error('Failed to fetch dashboard KPIs');
    }
  }

  // Analytics queries
  async getEfficiencyTrends(days: number = 30): Promise<any[]> {
    try {
      const fuelLogsRef = collection(db, 'fuelLogs');
      const q = query(fuelLogsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      // Process fuel logs to create efficiency trends
      const logs = snapshot.docs.map(doc => doc.data());
      // This would need more sophisticated aggregation logic
      return [];
    } catch (error) {
      console.error('Error fetching efficiency trends:', error);
      throw new Error('Failed to fetch efficiency trends');
    }
  }

  async getDepartmentFuelData(): Promise<any[]> {
    try {
      const vehicles = await this.getVehicles();
      const fuelLogs = await this.getFuelLogs();
      
      // Group fuel data by department
      const departmentData = vehicles.reduce((acc, vehicle) => {
        const dept = vehicle.department;
        if (!acc[dept]) {
          acc[dept] = { fuelUsed: 0, budget: 0 };
        }
        return acc;
      }, {} as Record<string, any>);

      // Calculate fuel usage by department
      fuelLogs.forEach(log => {
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        if (vehicle && departmentData[vehicle.department]) {
          departmentData[vehicle.department].fuelUsed += log.liters;
        }
      });

      return Object.entries(departmentData).map(([department, data]) => ({
        department,
        fuelUsed: data.fuelUsed,
        budget: data.budget,
        percentage: data.budget > 0 ? (data.fuelUsed / data.budget) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching department fuel data:', error);
      throw new Error('Failed to fetch department fuel data');
    }
  }

  async getAnomalies(): Promise<FuelLog[]> {
    try {
      const fuelLogsRef = collection(db, 'fuelLogs');
      const q = query(fuelLogsRef, where('isAnomalous', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FuelLog[];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw new Error('Failed to fetch anomalies');
    }
  }
}

export const firebaseService = new FirebaseService();