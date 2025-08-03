import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Route, Clock, Fuel, DollarSign, Car, Users, AlertTriangle, Calendar, MapPin, Building2 } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useData } from '../../context/DataContext';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedView, setSelectedView] = useState('daily');
  
  const { analyticsData, loading, error } = useAnalytics(timeRange, selectedView);
  const { refreshData } = useData();

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const formatCurrency = (amount: number) => {
    return `E${amount.toLocaleString()}`;
  };

  const formatLiters = (liters: number) => {
    return `${liters.toFixed(1)}L`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics Dashboard"
          description="Real-time fleet monitoring and fuel analytics"
          icon={TrendingUp}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics Dashboard"
          description="Real-time fleet monitoring and fuel analytics"
          icon={TrendingUp}
        />
        <ErrorMessage
          title="Failed to load analytics data"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Real-time fleet monitoring and fuel analytics"
        icon={TrendingUp}
        actions={
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>
        }
      />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Fuel className="w-8 h-8 text-green-600" />
            <span className="text-green-600 text-sm font-medium">
              {analyticsData.totalFuelUsed > 0 ? '+5.2%' : '0%'}
            </span>
          </div>
          <h3 className="text-green-800 text-sm font-medium">Total Fuel Used</h3>
          <p className="text-2xl font-bold text-green-900">{formatLiters(analyticsData.totalFuelUsed)}</p>
          <p className="text-green-700 text-sm">Last {timeRange} days</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-blue-600 text-sm font-medium">
              {analyticsData.totalCost > 0 ? '-3.1%' : '0%'}
            </span>
          </div>
          <h3 className="text-blue-800 text-sm font-medium">Total Cost</h3>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(analyticsData.totalCost)}</p>
          <p className="text-blue-700 text-sm">Last {timeRange} days</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Car className="w-8 h-8 text-purple-600" />
            <span className="text-purple-600 text-sm font-medium">{analyticsData.totalTrips}</span>
          </div>
          <h3 className="text-purple-800 text-sm font-medium">Total Trips</h3>
          <p className="text-2xl font-bold text-purple-900">{analyticsData.totalTrips}</p>
          <p className="text-purple-700 text-sm">Completed trips</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-orange-600 text-sm font-medium">{analyticsData.anomaliesCount}</span>
          </div>
          <h3 className="text-orange-800 text-sm font-medium">Anomalies Detected</h3>
          <p className="text-2xl font-bold text-orange-900">{analyticsData.anomaliesCount}</p>
          <p className="text-orange-700 text-sm">Fuel usage anomalies</p>
        </div>
      </div>

      {/* Fuel & Cost Trends */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Fuel & Cost Trends</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('daily')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedView === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedView('weekly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedView === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedView('monthly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedView === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel Consumption Trend */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Fuel Consumption Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.fuelTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [formatLiters(Number(value)), 'Consumption']} />
                <Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Trend */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Cost Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Cost']} />
                <Bar dataKey="cost" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Vehicle Performance</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.vehiclePerformance.slice(0, 5).map((vehicle, index) => (
              <div key={vehicle.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{vehicle.name}</p>
                    <p className="text-sm text-gray-600">
                      {vehicle.trips} trips • {vehicle.efficiency.toFixed(1)}L/100km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(vehicle.cost)}</p>
                  <p className="text-sm text-gray-600">{formatLiters(vehicle.fuelUsed)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Driver Performance</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.driverPerformance.slice(0, 5).map((driver, index) => (
              <div key={driver.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">
                      {driver.trips} trips • {driver.efficiency.toFixed(1)}L/100km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(driver.cost)}</p>
                  <p className="text-sm text-gray-600">{formatLiters(driver.fuelUsed)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Status */}
      {analyticsData.budgetStatus.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Budget Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.budgetStatus.map((budget) => (
              <div key={budget.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{budget.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    budget.status === 'critical' ? 'bg-red-100 text-red-800' :
                    budget.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {budget.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent:</span>
                    <span className="font-medium">{formatCurrency(budget.currentSpend)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Limit:</span>
                    <span className="font-medium">{formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        budget.status === 'critical' ? 'bg-red-500' :
                        budget.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {budget.percentage.toFixed(1)}% used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Anomalies */}
      {analyticsData.recentAnomalies.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recent Anomalies</h3>
          </div>
          <div className="space-y-3">
            {analyticsData.recentAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {anomaly.vehicleName} - {anomaly.driverName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(anomaly.date).toLocaleDateString()} • {anomaly.route}
                    </p>
                    <p className="text-xs text-orange-600">
                      {anomaly.anomalyReason || 'Unusual fuel consumption detected'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatLiters(anomaly.liters)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(anomaly.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Statistics */}
      {analyticsData.departmentStats.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Department Statistics</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip formatter={(value) => [formatLiters(Number(value)), 'Fuel Used']} />
              <Bar dataKey="fuelUsed" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};



export default AnalyticsDashboard;