import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { calculateAnalyticsData, calculateEfficiencyMetrics, calculateSavingsMetrics } from '../utils/analytics';

export function useAnalytics(timeRange: string = '30', selectedView: string = 'daily') {
  const { fuelLogs, vehicles, drivers, trips, budgets, loading, error } = useData();

  const analyticsData = useMemo(() => {
    return calculateAnalyticsData(fuelLogs, vehicles, drivers, trips, budgets, timeRange, selectedView);
  }, [fuelLogs, vehicles, drivers, trips, budgets, timeRange, selectedView]);

  const efficiencyMetrics = useMemo(() => {
    return calculateEfficiencyMetrics(vehicles, fuelLogs);
  }, [vehicles, fuelLogs]);

  const savingsMetrics = useMemo(() => {
    return calculateSavingsMetrics(fuelLogs, vehicles);
  }, [fuelLogs, vehicles]);

  const topPerformers = useMemo(() => {
    return {
      vehicles: analyticsData.vehiclePerformance.slice(0, 3),
      drivers: analyticsData.driverPerformance.slice(0, 3)
    };
  }, [analyticsData.vehiclePerformance, analyticsData.driverPerformance]);

  const budgetAlerts = useMemo(() => {
    return analyticsData.budgetStatus.filter(budget => budget.status === 'warning' || budget.status === 'critical');
  }, [analyticsData.budgetStatus]);

  const recentActivity = useMemo(() => {
    const recentFuelLogs = fuelLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return recentFuelLogs.map(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const driver = drivers.find(d => d.id === log.driverId);
      return {
        ...log,
        vehicleName: vehicle?.name || 'Unknown Vehicle',
        driverName: driver?.name || 'Unknown Driver'
      };
    });
  }, [fuelLogs, vehicles, drivers]);

  return {
    analyticsData,
    efficiencyMetrics,
    savingsMetrics,
    topPerformers,
    budgetAlerts,
    recentActivity,
    loading,
    error
  };
} 