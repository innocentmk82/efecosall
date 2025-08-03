import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { firebaseService } from '../services/firebaseService';
import { Vehicle, Driver, FuelLog, Trip, Budget, OBDAlert, OBDDevice, DashboardKPIs } from '../shared/types';
import { useToast } from '../components/common/ToastContainer';
import ErrorMessage from '../components/common/ErrorMessage';

interface DataContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  trips: Trip[];
  budgets: Budget[];
  obdAlerts: OBDAlert[];
  obdDevices: OBDDevice[];
  kpis: DashboardKPIs | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  
  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Driver operations
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  regenerateDriverPassword: (driverId: string) => Promise<string>;
  
  // Fuel log operations
  addFuelLog: (fuelLog: Omit<FuelLog, 'id'>) => Promise<void>;
  updateFuelLog: (id: string, fuelLog: Partial<FuelLog>) => Promise<void>;
  deleteFuelLog: (id: string) => Promise<void>;
  
  // Trip operations
  addTrip: (trip: Omit<Trip, 'id'>) => Promise<void>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  
  // Budget operations
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // OBD operations
  getOBDData: (vehicleId: string) => any;
  getOBDAlerts: (vehicleId: string) => OBDAlert[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, business } = useAuth();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [obdAlerts, setObdAlerts] = useState<OBDAlert[]>([]);
  const [obdDevices, setObdDevices] = useState<OBDDevice[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const [
        vehiclesData, 
        driversData, 
        fuelLogsData, 
        tripsData, 
        budgetsData,
        obdAlertsData,
        obdDevicesData,
        kpisData
      ] = await Promise.all([
        firebaseService.getVehicles(),
        firebaseService.getDrivers(),
        firebaseService.getFuelLogs(),
        firebaseService.getTrips(),
        firebaseService.getBudgets(),
        firebaseService.getOBDAlerts(),
        firebaseService.getOBDDevices(),
        firebaseService.getDashboardKPIs()
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setFuelLogs(fuelLogsData);
      setTrips(tripsData);
      setBudgets(budgetsData);
      setObdAlerts(obdAlertsData);
      setObdDevices(obdDevicesData);
      setKpis(kpisData);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Reset data when user is null
      setVehicles([]);
      setDrivers([]);
      setFuelLogs([]);
      setTrips([]);
      setBudgets([]);
      setKpis(null);
    }
  }, [user]);

  // Vehicle operations
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const id = await firebaseService.addVehicle(vehicle);
      addToast({
        type: 'success',
        title: 'Vehicle Added',
        message: `${vehicle.name} has been successfully added to your fleet.`
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle');
      addToast({
        type: 'error',
        title: 'Failed to Add Vehicle',
        message: err.message || 'An error occurred while adding the vehicle.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const updateVehicle = useCallback(async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      await firebaseService.updateVehicle(id, vehicle);
      addToast({
        type: 'success',
        title: 'Vehicle Updated',
        message: 'Vehicle information has been successfully updated.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle');
      addToast({
        type: 'error',
        title: 'Failed to Update Vehicle',
        message: err.message || 'An error occurred while updating the vehicle.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteVehicle(id);
      addToast({
        type: 'success',
        title: 'Vehicle Deleted',
        message: 'Vehicle has been successfully removed from your fleet.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete vehicle');
      addToast({
        type: 'error',
        title: 'Failed to Delete Vehicle',
        message: err.message || 'An error occurred while deleting the vehicle.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  // Driver operations
  const addDriver = useCallback(async (driver: Omit<Driver, 'id'>) => {
    try {
      const id = await firebaseService.addDriver(driver);
      addToast({
        type: 'success',
        title: 'Driver Added',
        message: `${driver.name} has been successfully added to your team.`
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to add driver');
      addToast({
        type: 'error',
        title: 'Failed to Add Driver',
        message: err.message || 'An error occurred while adding the driver.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const updateDriver = useCallback(async (id: string, driver: Partial<Driver>) => {
    try {
      await firebaseService.updateDriver(id, driver);
      addToast({
        type: 'success',
        title: 'Driver Updated',
        message: 'Driver information has been successfully updated.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update driver');
      addToast({
        type: 'error',
        title: 'Failed to Update Driver',
        message: err.message || 'An error occurred while updating the driver.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const deleteDriver = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteDriver(id);
      addToast({
        type: 'success',
        title: 'Driver Deleted',
        message: 'Driver has been successfully removed from your team.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete driver');
      addToast({
        type: 'error',
        title: 'Failed to Delete Driver',
        message: err.message || 'An error occurred while deleting the driver.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const regenerateDriverPassword = useCallback(async (driverId: string): Promise<string> => {
    try {
      const newPassword = await firebaseService.regenerateTemporalPassword(driverId);
      addToast({
        type: 'success',
        title: 'Password Regenerated',
        message: 'Temporal password has been successfully regenerated.'
      });
      await refreshData();
      return newPassword;
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate password');
      addToast({
        type: 'error',
        title: 'Failed to Regenerate Password',
        message: err.message || 'An error occurred while regenerating the password.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  // Fuel log operations
  const addFuelLog = useCallback(async (fuelLog: Omit<FuelLog, 'id'>) => {
    try {
      const id = await firebaseService.addFuelLog(fuelLog);
      addToast({
        type: 'success',
        title: 'Fuel Log Added',
        message: 'Fuel entry has been successfully recorded.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to add fuel log');
      addToast({
        type: 'error',
        title: 'Failed to Add Fuel Log',
        message: err.message || 'An error occurred while adding the fuel log.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const updateFuelLog = useCallback(async (id: string, fuelLog: Partial<FuelLog>) => {
    try {
      await firebaseService.updateFuelLog(id, fuelLog);
      addToast({
        type: 'success',
        title: 'Fuel Log Updated',
        message: 'Fuel entry has been successfully updated.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update fuel log');
      addToast({
        type: 'error',
        title: 'Failed to Update Fuel Log',
        message: err.message || 'An error occurred while updating the fuel log.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const deleteFuelLog = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteFuelLog(id);
      addToast({
        type: 'success',
        title: 'Fuel Log Deleted',
        message: 'Fuel entry has been successfully deleted.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete fuel log');
      addToast({
        type: 'error',
        title: 'Failed to Delete Fuel Log',
        message: err.message || 'An error occurred while deleting the fuel log.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  // Trip operations
  const addTrip = useCallback(async (trip: Omit<Trip, 'id'>) => {
    try {
      const id = await firebaseService.addTrip(trip);
      addToast({
        type: 'success',
        title: 'Trip Added',
        message: 'Trip has been successfully created.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to add trip');
      addToast({
        type: 'error',
        title: 'Failed to Add Trip',
        message: err.message || 'An error occurred while adding the trip.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const updateTrip = useCallback(async (id: string, trip: Partial<Trip>) => {
    try {
      await firebaseService.updateTrip(id, trip);
      addToast({
        type: 'success',
        title: 'Trip Updated',
        message: 'Trip information has been successfully updated.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update trip');
      addToast({
        type: 'error',
        title: 'Failed to Update Trip',
        message: err.message || 'An error occurred while updating the trip.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const deleteTrip = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteTrip(id);
      addToast({
        type: 'success',
        title: 'Trip Deleted',
        message: 'Trip has been successfully deleted.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip');
      addToast({
        type: 'error',
        title: 'Failed to Delete Trip',
        message: err.message || 'An error occurred while deleting the trip.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  // Budget operations
  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    try {
      const id = await firebaseService.addBudget(budget);
      addToast({
        type: 'success',
        title: 'Budget Created',
        message: `${budget.name} budget has been successfully created.`
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to add budget');
      addToast({
        type: 'error',
        title: 'Failed to Create Budget',
        message: err.message || 'An error occurred while creating the budget.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const updateBudget = useCallback(async (id: string, budget: Partial<Budget>) => {
    try {
      await firebaseService.updateBudget(id, budget);
      addToast({
        type: 'success',
        title: 'Budget Updated',
        message: 'Budget has been successfully updated.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
      addToast({
        type: 'error',
        title: 'Failed to Update Budget',
        message: err.message || 'An error occurred while updating the budget.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteBudget(id);
      addToast({
        type: 'success',
        title: 'Budget Deleted',
        message: 'Budget has been successfully deleted.'
      });
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
      addToast({
        type: 'error',
        title: 'Failed to Delete Budget',
        message: err.message || 'An error occurred while deleting the budget.'
      });
      throw err;
    }
  }, [refreshData, addToast]);

  // OBD operations
  const getOBDData = useCallback((vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.obdData || null;
  }, [vehicles]);

  const getOBDAlerts = useCallback((vehicleId: string) => {
    return obdAlerts.filter(alert => alert.vehicleId === vehicleId);
  }, [obdAlerts]);

  const contextValue = useMemo(() => ({
    vehicles,
    drivers,
    fuelLogs,
    trips,
    budgets,
    obdAlerts,
    obdDevices,
    kpis,
    loading,
    error,
    refreshData,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addDriver,
    updateDriver,
    deleteDriver,
    regenerateDriverPassword,
    addFuelLog,
    updateFuelLog,
    deleteFuelLog,
    addTrip,
    updateTrip,
    deleteTrip,
    addBudget,
    updateBudget,
    deleteBudget,
    getOBDData,
    getOBDAlerts
  }), [
    vehicles, drivers, fuelLogs, trips, budgets, obdAlerts, obdDevices, kpis, loading, error,
    refreshData, addVehicle, updateVehicle, deleteVehicle, addDriver, updateDriver, deleteDriver,
    regenerateDriverPassword, addFuelLog, updateFuelLog, deleteFuelLog, addTrip, updateTrip, deleteTrip,
    addBudget, updateBudget, deleteBudget, getOBDData, getOBDAlerts
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};