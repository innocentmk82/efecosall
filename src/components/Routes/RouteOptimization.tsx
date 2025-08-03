import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Route, MapPin, Clock, TrendingUp, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';


const RouteOptimization: React.FC = () => {
  const { trips, loading, error, refreshData } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  // Use real data from Firebase
  const displayTrips = trips;

  const routeData = [
    { route: 'Warehouse A → Customer B', optimized: 85, standard: 95, savings: 10 },
    { route: 'Office → Client Meeting', optimized: 78, standard: 82, savings: 4 },
    { route: 'Depot → Construction Site', optimized: 92, standard: 88, savings: -4 },
    { route: 'Distribution Center → Retail', optimized: 81, standard: 89, savings: 8 },
    { route: 'Factory → Port', optimized: 87, standard: 93, savings: 6 }
  ];

  const optimizationTrends = [
    { date: '2024-01', efficiency: 82, target: 85 },
    { date: '2024-02', efficiency: 84, target: 85 },
    { date: '2024-03', efficiency: 87, target: 85 },
    { date: '2024-04', efficiency: 89, target: 85 },
    { date: '2024-05', efficiency: 91, target: 85 },
    { date: '2024-06', efficiency: 88, target: 85 }
  ];

  const topRoutes = [
    { route: 'Warehouse A → Customer B', fuelSaved: 12.5, timeSaved: 15, costSaved: 18.75 },
    { route: 'Distribution Center → Retail', fuelSaved: 8.2, timeSaved: 8, costSaved: 12.30 },
    { route: 'Factory → Port', fuelSaved: 6.8, timeSaved: 12, costSaved: 10.20 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Route Optimization History"
          description="Analyze fuel-efficient routes and optimization performance"
          icon={Route}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
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
          title="Route Optimization History"
          description="Analyze fuel-efficient routes and optimization performance"
          icon={Route}
        />
        <ErrorMessage
          title="Failed to load route data"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Optimization History"
        description="Analyze fuel-efficient routes and optimization performance"
        icon={Route}
        actions={
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Vehicles</option>
              <option value="1">Ford Transit</option>
              <option value="2">Toyota Camry</option>
              <option value="3">Chevrolet Silverado</option>
            </select>
          </div>
        }
      />

      {/* Route Efficiency Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Route Efficiency</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">87%</div>
          <p className="text-sm text-gray-500 mt-2">+5% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fuel Saved This Month</h3>
            <Route className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">342L</div>
          <p className="text-sm text-gray-500 mt-2">E513 in cost savings</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Saved</h3>
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">28h</div>
          <p className="text-sm text-gray-500 mt-2">Average 15min per trip</p>
        </div>
      </div>

      {/* Route Comparison Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Route Efficiency Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="optimized" fill="#3B82F6" name="Optimized Route" />
              <Bar dataKey="standard" fill="#EF4444" name="Standard Route" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optimization Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Optimization Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={optimizationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Routes</h3>
          <div className="space-y-4">
            {topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{route.route}</p>
                    <p className="text-sm text-gray-500">Fuel saved: {route.fuelSaved}L</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">E{route.costSaved}</p>
                  <p className="text-sm text-gray-500">{route.timeSaved}min saved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Optimizations */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Route Optimizations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Route</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Fuel Saved</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Time Saved</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayTrips.slice(0, 5).map((trip) => (
                <tr key={trip.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {trip.startLocation} → {trip.endLocation}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">Vehicle {trip.vehicleId}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(trip.startTime).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">
                    {((trip.predictedFuel || 0) - (trip.actualFuel || trip.fuelUsed || 0)).toFixed(1)}L
                  </td>
                  <td className="py-3 px-4 text-blue-600 font-medium">
                    {Math.round((trip.idleTime || 0) / 60)}min
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Optimized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization; 