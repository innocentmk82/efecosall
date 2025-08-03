import { Vehicle, Driver, FuelLog, Trip, Budget } from '../types';
import { calculateEfficiencyScore, detectFuelAnomalies, calculateFuelSavings, getBudgetStatus } from './calculations';

export interface AnalyticsData {
  totalFuelUsed: number;
  totalCost: number;
  averageEfficiency: number;
  totalTrips: number;
  anomaliesCount: number;
  fuelTrends: Array<{ period: string; consumption: number }>;
  costTrends: Array<{ period: string; cost: number }>;
  vehiclePerformance: Array<{
    name: string;
    fuelUsed: number;
    cost: number;
    efficiency: number;
    trips: number;
    status: string;
    avgCostPerTrip: number;
  }>;
  driverPerformance: Array<{
    name: string;
    fuelUsed: number;
    cost: number;
    efficiency: number;
    trips: number;
    avgCostPerTrip: number;
  }>;
  departmentStats: Array<{
    department: string;
    fuelUsed: number;
    vehicleCount: number;
  }>;
  budgetStatus: Array<{
    name: string;
    department: string;
    currentSpend: number;
    limit: number;
    percentage: number;
    status: 'good' | 'warning' | 'critical';
    remaining: number;
  }>;
  recentAnomalies: Array<FuelLog & {
    vehicleName: string;
    driverName: string;
  }>;
}

export function calculateAnalyticsData(
  fuelLogs: FuelLog[],
  vehicles: Vehicle[],
  drivers: Driver[],
  trips: Trip[],
  budgets: Budget[],
  timeRange: string,
  selectedView: string
): AnalyticsData {
  if (!fuelLogs.length || !vehicles.length || !drivers.length) {
    return {
      totalFuelUsed: 0,
      totalCost: 0,
      averageEfficiency: 0,
      totalTrips: 0,
      anomaliesCount: 0,
      fuelTrends: [],
      costTrends: [],
      vehiclePerformance: [],
      driverPerformance: [],
      departmentStats: [],
      budgetStatus: [],
      recentAnomalies: []
    };
  }

  const now = new Date();
  const daysAgo = parseInt(timeRange);
  const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

  // Filter data based on time range
  const filteredFuelLogs = fuelLogs.filter(log => new Date(log.date) >= startDate);
  const filteredTrips = trips.filter(trip => new Date(trip.startTime) >= startDate);

  // Calculate totals
  const totalFuelUsed = filteredFuelLogs.reduce((sum, log) => sum + log.liters, 0);
  const totalCost = filteredFuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalTrips = filteredTrips.length;
  const anomaliesCount = filteredFuelLogs.filter(log => log.isAnomalous).length;

  // Calculate average efficiency
  const totalEfficiency = filteredFuelLogs.reduce((sum, log) => sum + log.efficiency, 0);
  const averageEfficiency = filteredFuelLogs.length > 0 ? totalEfficiency / filteredFuelLogs.length : 0;

  // Generate fuel trends by day/week
  const fuelTrends = generateFuelTrends(filteredFuelLogs, selectedView);
  const costTrends = generateCostTrends(filteredFuelLogs, selectedView);

  // Vehicle performance analysis
  const vehiclePerformance = vehicles.map(vehicle => {
    const vehicleLogs = filteredFuelLogs.filter(log => log.vehicleId === vehicle.id);
    const vehicleTrips = filteredTrips.filter(trip => trip.vehicleId === vehicle.id);
    
    const totalFuel = vehicleLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = vehicleLogs.reduce((sum, log) => sum + log.cost, 0);
    const avgEfficiency = vehicleLogs.length > 0 
      ? vehicleLogs.reduce((sum, log) => sum + log.efficiency, 0) / vehicleLogs.length 
      : vehicle.efficiencyScore;

    return {
      name: vehicle.name,
      fuelUsed: totalFuel,
      cost: totalCost,
      efficiency: avgEfficiency,
      trips: vehicleTrips.length,
      status: vehicle.status,
      avgCostPerTrip: vehicleTrips.length > 0 ? totalCost / vehicleTrips.length : 0
    };
  }).sort((a, b) => b.fuelUsed - a.fuelUsed);

  // Driver performance analysis
  const driverPerformance = drivers.map(driver => {
    const driverLogs = filteredFuelLogs.filter(log => log.driverId === driver.id);
    const driverTrips = filteredTrips.filter(trip => trip.driverId === driver.id);
    
    const totalFuel = driverLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = driverLogs.reduce((sum, log) => sum + log.cost, 0);
    const avgEfficiency = driverLogs.length > 0 
      ? driverLogs.reduce((sum, log) => sum + log.efficiency, 0) / driverLogs.length 
      : driver.efficiencyScore;

    return {
      name: driver.name,
      fuelUsed: totalFuel,
      cost: totalCost,
      efficiency: avgEfficiency,
      trips: driverTrips.length,
      avgCostPerTrip: driverTrips.length > 0 ? totalCost / driverTrips.length : 0
    };
  }).sort((a, b) => b.efficiency - a.efficiency);

  // Department statistics
  const departmentStats = calculateDepartmentStats(vehicles, filteredFuelLogs);

  // Budget status
  const budgetStatus = budgets.map(budget => {
    const budgetVehicles = vehicles.filter(v => budget.vehicleIds.includes(v.id));
    const budgetLogs = filteredFuelLogs.filter(log => 
      budgetVehicles.some(v => v.id === log.vehicleId)
    );
    const currentSpend = budgetLogs.reduce((sum, log) => sum + log.cost, 0);
    const status = getBudgetStatus(currentSpend, budget.monthlyLimit);

    return {
      name: budget.name,
      department: budget.department,
      currentSpend,
      limit: budget.monthlyLimit,
      percentage: status.percentage,
      status: status.status,
      remaining: status.remaining
    };
  });

  // Recent anomalies
  const recentAnomalies = filteredFuelLogs
    .filter(log => log.isAnomalous)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const driver = drivers.find(d => d.id === log.driverId);
      return {
        ...log,
        vehicleName: vehicle?.name || 'Unknown Vehicle',
        driverName: driver?.name || 'Unknown Driver'
      };
    });

  return {
    totalFuelUsed,
    totalCost,
    averageEfficiency,
    totalTrips,
    anomaliesCount,
    fuelTrends,
    costTrends,
    vehiclePerformance,
    driverPerformance,
    departmentStats,
    budgetStatus,
    recentAnomalies
  };
}

function generateFuelTrends(fuelLogs: FuelLog[], view: string) {
  const grouped = fuelLogs.reduce((acc, log) => {
    const date = new Date(log.date);
    let key;
    
    if (view === 'daily') {
      key = date.toLocaleDateString();
    } else if (view === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = `Week ${weekStart.toLocaleDateString()}`;
    } else {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    
    if (!acc[key]) acc[key] = 0;
    acc[key] += log.liters;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([period, consumption]) => ({
    period,
    consumption
  }));
}

function generateCostTrends(fuelLogs: FuelLog[], view: string) {
  const grouped = fuelLogs.reduce((acc, log) => {
    const date = new Date(log.date);
    let key;
    
    if (view === 'daily') {
      key = date.toLocaleDateString();
    } else if (view === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = `Week ${weekStart.toLocaleDateString()}`;
    } else {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    
    if (!acc[key]) acc[key] = 0;
    acc[key] += log.cost;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([period, cost]) => ({
    period,
    cost
  }));
}

function calculateDepartmentStats(vehicles: Vehicle[], fuelLogs: FuelLog[]) {
  const deptStats = vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.department]) {
      acc[vehicle.department] = { fuelUsed: 0, vehicleCount: 0 };
    }
    acc[vehicle.department].vehicleCount++;
    return acc;
  }, {} as Record<string, { fuelUsed: number; vehicleCount: number }>);

  fuelLogs.forEach(log => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    if (vehicle && deptStats[vehicle.department]) {
      deptStats[vehicle.department].fuelUsed += log.liters;
    }
  });

  return Object.entries(deptStats).map(([department, stats]) => ({
    department,
    fuelUsed: stats.fuelUsed,
    vehicleCount: stats.vehicleCount
  }));
}

export function calculateEfficiencyMetrics(vehicles: Vehicle[], fuelLogs: FuelLog[]) {
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const totalFuelUsed = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
  const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  
  const averageEfficiency = vehicles.length > 0 
    ? vehicles.reduce((sum, v) => sum + v.efficiencyScore, 0) / vehicles.length 
    : 0;

  return {
    totalVehicles,
    activeVehicles,
    utilizationRate: totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
    totalFuelUsed,
    totalCost,
    averageEfficiency
  };
}

export function calculateSavingsMetrics(fuelLogs: FuelLog[], vehicles: Vehicle[]) {
  const totalSavings = fuelLogs.reduce((sum, log) => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    if (vehicle) {
      const expectedFuel = (log.tripDistance / 100) * vehicle.averageConsumption;
      const savings = Math.max(0, expectedFuel - log.liters);
      return sum + (savings * 1.5); // Assuming E1.50 per liter
    }
    return sum;
  }, 0);

  const totalLitersSaved = fuelLogs.reduce((sum, log) => {
    const vehicle = vehicles.find(v => v.id === log.vehicleId);
    if (vehicle) {
      const expectedFuel = (log.tripDistance / 100) * vehicle.averageConsumption;
      return sum + Math.max(0, expectedFuel - log.liters);
    }
    return sum;
  }, 0);

  return {
    totalSavings,
    totalLitersSaved,
    averageSavingsPerTrip: fuelLogs.length > 0 ? totalSavings / fuelLogs.length : 0
  };
} 