import React from 'react';
import { Fuel, DollarSign, Car, Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AnalyticsSummaryProps {
  timeRange?: string;
  selectedView?: string;
  showDetails?: boolean;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ 
  timeRange = '30', 
  selectedView = 'daily',
  showDetails = true 
}) => {
  const { analyticsData, efficiencyMetrics, savingsMetrics, budgetAlerts } = useAnalytics(timeRange, selectedView);

  const formatCurrency = (amount: number) => {
    return `E${amount.toLocaleString()}`;
  };

  const formatLiters = (liters: number) => {
    return `${liters.toFixed(1)}L`;
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Fuel className="w-6 h-6 text-green-600" />
            {getTrendIcon(5.2)}
          </div>
          <h3 className="text-green-800 text-sm font-medium">Total Fuel Used</h3>
          <p className="text-xl font-bold text-green-900">{formatLiters(analyticsData.totalFuelUsed)}</p>
          <p className="text-green-700 text-xs">Last {timeRange} days</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            {getTrendIcon(-3.1)}
          </div>
          <h3 className="text-blue-800 text-sm font-medium">Total Cost</h3>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(analyticsData.totalCost)}</p>
          <p className="text-blue-700 text-xs">Last {timeRange} days</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-6 h-6 text-purple-600" />
            <span className="text-purple-600 text-sm font-medium">{analyticsData.totalTrips}</span>
          </div>
          <h3 className="text-purple-800 text-sm font-medium">Total Trips</h3>
          <p className="text-xl font-bold text-purple-900">{analyticsData.totalTrips}</p>
          <p className="text-purple-700 text-xs">Completed trips</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <span className="text-orange-600 text-sm font-medium">{analyticsData.anomaliesCount}</span>
          </div>
          <h3 className="text-orange-800 text-sm font-medium">Anomalies</h3>
          <p className="text-xl font-bold text-orange-900">{analyticsData.anomaliesCount}</p>
          <p className="text-orange-700 text-xs">Detected issues</p>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Efficiency Metrics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{efficiencyMetrics.utilizationRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Fleet Utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageEfficiency.toFixed(1)}L/100km</p>
                <p className="text-sm text-gray-600">Average Efficiency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(savingsMetrics.totalSavings)}</p>
                <p className="text-sm text-gray-600">Total Savings</p>
              </div>
            </div>
          </div>

          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Alerts</h3>
              <div className="space-y-3">
                {budgetAlerts.map((budget) => (
                  <div key={budget.name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{budget.name}</p>
                      <p className="text-sm text-gray-600">{budget.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(budget.currentSpend)}</p>
                      <p className="text-sm text-red-600">{budget.percentage.toFixed(1)}% of limit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsSummary; 