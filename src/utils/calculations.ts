import { Vehicle, Driver, FuelLog, Trip } from '../types';

export const calculateEfficiencyScore = (actualConsumption: number, vehicleAverage: number): number => {
  const efficiency = (vehicleAverage / actualConsumption) * 100;
  return Math.min(Math.max(efficiency, 0), 100);
};

export const detectFuelAnomalies = (fuelLog: FuelLog, vehicle: Vehicle): boolean => {
  const expectedConsumption = (fuelLog.tripDistance / 100) * vehicle.averageConsumption;
  const variance = Math.abs(fuelLog.liters - expectedConsumption) / expectedConsumption;
  
  // Flag as anomalous if fuel usage is 30% above or 20% below expected
  return variance > 0.30 || (fuelLog.liters < expectedConsumption && variance > 0.20);
};

export const calculateFuelSavings = (predictedFuel: number, actualFuel: number, fuelPrice: number = 1.50): number => {
  const litersSaved = predictedFuel - actualFuel;
  return litersSaved * fuelPrice;
};

export const predictFuelConsumption = (distance: number, vehicleConsumption: number, driverEfficiency: number): number => {
  const baseFuel = (distance / 100) * vehicleConsumption;
  const efficiencyMultiplier = driverEfficiency / 100;
  return baseFuel * (2 - efficiencyMultiplier); // Better efficiency reduces fuel consumption
};

export const getBudgetStatus = (currentSpend: number, budget: number, threshold: number = 80): {
  status: 'good' | 'warning' | 'critical';
  percentage: number;
  remaining: number;
} => {
  // Handle edge cases to prevent NaN
  if (!budget || budget <= 0) {
    return { status: 'good', percentage: 0, remaining: 0 };
  }
  
  const percentage = (currentSpend / budget) * 100;
  const remaining = budget - currentSpend;
  
  let status: 'good' | 'warning' | 'critical' = 'good';
  if (percentage >= 100) status = 'critical';
  else if (percentage >= threshold) status = 'warning';
  
  return { status, percentage: isNaN(percentage) ? 0 : percentage, remaining: isNaN(remaining) ? 0 : remaining };
};

export const calculateDriverRanking = (drivers: Driver[]): Driver[] => {
  return [...drivers].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
};

export const calculateVehicleRanking = (vehicles: Vehicle[]): Vehicle[] => {
  return [...vehicles].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
};

export const getRouteOptimizationSuggestions = (trips: Trip[]): {
  route: string;
  averageEfficiency: number;
  tripCount: number;
  potentialSavings: number;
}[] => {
  const routeStats = trips.reduce((acc, trip) => {
    if (!acc[trip.route]) {
      acc[trip.route] = { totalEfficiency: 0, count: 0, totalSavings: 0 };
    }
    acc[trip.route].totalEfficiency += trip.efficiency;
    acc[trip.route].count++;
    acc[trip.route].totalSavings += calculateFuelSavings(trip.predictedFuel, trip.actualFuel);
    return acc;
  }, {} as Record<string, { totalEfficiency: number; count: number; totalSavings: number }>);

  return Object.entries(routeStats).map(([route, stats]) => ({
    route,
    averageEfficiency: stats.totalEfficiency / stats.count,
    tripCount: stats.count,
    potentialSavings: stats.totalSavings
  })).sort((a, b) => b.potentialSavings - a.potentialSavings);
};