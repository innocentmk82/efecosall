import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Fuel, 
  TrendingUp, 
  Route, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Car,
  User,
  Target,
  Zap,
  BarChart3,
  Play,
  Pause,
  StopCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Activity,
  Gauge,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Power,
  PowerOff
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import AIRouteOptimization from './AIRouteOptimization';
import PageHeader from '../common/PageHeader';
import { SkeletonTable } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import SearchInput from '../common/SearchInput';
import Modal from '../common/Modal';


interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  distance: number;
  fuelUsed: number;
  cost: number;
  status: 'Completed' | 'In Progress' | 'Planned' | 'Cancelled';
  routeOptimization: 'Optimized' | 'Standard' | 'Manual';
  tag: string;
  efficiency?: number;
  obdData?: {
    engineRPM: number;
    fuelLevel: number;
    batteryVoltage: number;
    engineTemperature: number;
    vehicleSpeed: number;
    odometer: number;
    tripDistance: number;
    isConnected: boolean;
    lastUpdate: string;
  };
  aiOptimization?: {
    suggestedRoute: string;
    estimatedSavings: number;
    alternativeStops: string[];
    trafficConditions: string;
    weatherImpact: string;
  };
}

const TripsPage: React.FC = () => {
  const { vehicles, drivers, fuelLogs, trips, loading, error, getOBDData, getOBDAlerts, refreshData } = useData();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'analytics' | 'optimization'>('list');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);

  // Use real data from Firebase
  const displayTrips = trips;
  const displayVehicles = vehicles;
  const displayDrivers = drivers;
  const displayFuelLogs = fuelLogs;

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Planned': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const optimizationColors = {
    'Optimized': 'bg-purple-100 text-purple-800',
    'Standard': 'bg-gray-100 text-gray-800',
    'Manual': 'bg-orange-100 text-orange-800'
  };

  // Simulate real-time trip updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrips(prev => prev.map(trip => {
        if (trip.status === 'In Progress') {
          const vehicle = displayVehicles.find(v => v.id === trip.vehicleId);
          const obdData = vehicle?.obdData;
          
          if (obdData && obdData.isConnected) {
            return {
              ...trip,
              distance: trip.distance + (obdData.vehicleSpeed / 3600), // km/h to km/s
              fuelUsed: trip.fuelUsed + (obdData.fuelFlowRate / 3600), // L/h to L/s
              obdData: {
                engineRPM: obdData.engineRPM,
                fuelLevel: obdData.fuelLevel,
                batteryVoltage: obdData.batteryVoltage,
                engineTemperature: obdData.engineTemperature,
                vehicleSpeed: obdData.vehicleSpeed,
                odometer: obdData.odometer,
                tripDistance: obdData.tripDistance,
                isConnected: obdData.isConnected,
                lastUpdate: obdData.lastUpdate
              }
            };
          }
        }
        return trip;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [displayVehicles]);

  const getVehicleName = (vehicleId: string) => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const getDriverName = (driverId: string) => {
    const driver = displayDrivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getVehicleOBDStatus = (vehicleId: string) => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    return vehicle?.obdData?.isConnected || false;
  };

  const getVehicleOBDData = (vehicleId: string) => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    return vehicle?.obdData;
  };

  const getTripFuelLogs = (tripId: string) => {
    return displayFuelLogs.filter(log => log.vehicleId === tripId);
  };

  const filteredTrips = displayTrips.filter(trip => {
    const vehicle = displayVehicles.find(v => v.id === trip.vehicleId);
    const driver = displayDrivers.find(d => d.id === trip.driverId);
    const matchesSearch =
      (vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesTag = filterTag === 'all' || trip.tag === filterTag;
    const matchesVehicle = filterVehicle === 'all' || trip.vehicleId === filterVehicle;
    return matchesSearch && matchesStatus && matchesTag && matchesVehicle;
  });

  const handleOptimizeRoute = async (tripId: string) => {
    setIsOptimizing(true);
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setActiveTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          routeOptimization: 'Optimized',
          aiOptimization: {
            suggestedRoute: 'Alternative route via Highway A1 - 15% faster',
            estimatedSavings: 2.3,
            alternativeStops: ['Rest stop at km 45', 'Fuel station at km 78'],
            trafficConditions: 'Low traffic expected',
            weatherImpact: 'Clear weather - optimal conditions'
          }
        };
      }
      return trip;
    }));
    setIsOptimizing(false);
  };

  const calculateEfficiency = (fuelUsed: number, distance: number) => {
    return distance > 0 ? ((fuelUsed / distance) * 100).toFixed(1) : '0';
  };

  const getTripStats = () => {
    const totalTrips = displayTrips.length;
    const completedTrips = displayTrips.filter(t => t.status === 'Completed').length;
    const inProgressTrips = displayTrips.filter(t => t.status === 'In Progress').length;
    const totalDistance = displayTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFuelUsed = displayTrips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    const averageEfficiency = totalDistance > 0 ? ((totalFuelUsed / totalDistance) * 100).toFixed(1) : '0';
    const optimizedTrips = displayTrips.filter(t => t.routeOptimization === 'Optimized').length;
    const connectedVehicles = displayVehicles.filter(v => v.obdData?.isConnected).length;

    return {
      totalTrips,
      completedTrips,
      inProgressTrips,
      totalDistance,
      totalFuelUsed,
      averageEfficiency,
      optimizedTrips,
      connectedVehicles
    };
  };

  const stats = getTripStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Trips Management"
          description="Monitor and optimize fleet trips with real-time OBD integration"
          icon={MapPin}
        />
        <SkeletonTable rows={8} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Trips Management"
          description="Monitor and optimize fleet trips with real-time OBD integration"
          icon={MapPin}
        />
        <ErrorMessage
          title="Failed to load trips data"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Trips Management"
        description="Monitor and optimize fleet trips with real-time OBD integration"
        icon={MapPin}
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setViewMode('optimization')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'optimization' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              AI Optimization
            </button>
          </div>
        }
      />

      {/* Real-time OBD Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Fleet Monitoring</h3>
            <p className="text-sm text-gray-600">Live OBD data integration with active trips</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Connected Vehicles</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.connectedVehicles}
            </span>
            <span className="text-sm text-gray-600">/ {vehicles.length} vehicles</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Active Trips</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.inProgressTrips}
            </span>
            <span className="text-sm text-gray-600">trips</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Avg Efficiency</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.averageEfficiency}
            </span>
            <span className="text-sm text-gray-600">L/100km</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">AI Optimized</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.optimizedTrips}
            </span>
            <span className="text-sm text-gray-600">trips</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressTrips}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Optimized</p>
              <p className="text-2xl font-bold text-gray-900">{stats.optimizedTrips}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageEfficiency} L/100km</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search trips..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Planned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Vehicles</option>
              {displayVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tags</option>
              <option value="Business">Business</option>
              <option value="Delivery">Delivery</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 inline mr-2" />
              New Trip
            </button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle & Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OBD Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => {
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const obdData = vehicle?.obdData;
                  const isConnected = getVehicleOBDStatus(trip.vehicleId);
                  
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Trip #{trip.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(trip.startTime).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${optimizationColors[trip.routeOptimization]}`}>
                            {trip.routeOptimization}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getVehicleName(trip.vehicleId)}</p>
                            <p className="text-sm text-gray-500">{getDriverName(trip.driverId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-600">
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                          {isConnected && obdData && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-green-600">{Math.round(obdData.engineRPM)} RPM</span>
                              <span className="text-blue-600">{Math.round(obdData.fuelLevel)}%</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{trip.startLocation}</p>
                          <p className="text-sm text-gray-500">→ {trip.endLocation}</p>
                          <p className="text-xs text-gray-400">{trip.distance.toFixed(1)} km</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{trip.fuelUsed.toFixed(1)}L</p>
                          <p className="text-sm text-gray-500">
                            {calculateEfficiency(trip.fuelUsed, trip.distance)} L/100km
                          </p>
                          <p className="text-xs text-gray-400">${trip.cost.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTrip(trip)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {trip.routeOptimization !== 'Optimized' && (
                            <button
                              onClick={() => handleOptimizeRoute(trip.id)}
                              disabled={isOptimizing}
                              className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                              title="Optimize Route"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-800" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map View</h3>
              <p className="text-gray-500">Map integration coming soon</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Distance</span>
                <span className="font-medium">{stats.totalDistance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Fuel Used</span>
                <span className="font-medium">{stats.totalFuelUsed.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Efficiency</span>
                <span className="font-medium">{stats.averageEfficiency} L/100km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Optimization Rate</span>
                <span className="font-medium">{((stats.optimizedTrips / stats.totalTrips) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Optimization Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">Fuel Savings</span>
                </div>
                <span className="font-medium text-green-600">+15.2%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Time Savings</span>
                </div>
                <span className="font-medium text-blue-600">+8.7%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Route className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-700">Route Efficiency</span>
                </div>
                <span className="font-medium text-purple-600">+12.3%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Optimization View */}
      {viewMode === 'optimization' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <AIRouteOptimization
            startLocation="Warehouse A"
            endLocation="Customer Site B"
            vehicleType="Ford Transit"
            driverPreferences={{
              avoidTolls: false,
              preferHighways: true,
              maxDistance: 200
            }}
            onOptimizationComplete={(result) => {
              console.log('Optimization completed:', result);
            }}
          />
        </div>
      )}

      {/* Trip Details Modal */}
      <Modal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title="Trip Details"
        size="xl"
      >
        {selectedTrip && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Trip Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">{getVehicleName(selectedTrip.vehicleId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Driver</p>
                    <p className="font-medium">{getDriverName(selectedTrip.driverId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">{selectedTrip.startLocation} → {selectedTrip.endLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-medium">{selectedTrip.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedTrip.status]}`}>
                      {selectedTrip.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Performance</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Fuel Used</p>
                    <p className="font-medium">{selectedTrip.fuelUsed.toFixed(1)} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="font-medium">{calculateEfficiency(selectedTrip.fuelUsed, selectedTrip.distance)} L/100km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="font-medium">${selectedTrip.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Route Optimization</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${optimizationColors[selectedTrip.routeOptimization]}`}>
                      {selectedTrip.routeOptimization}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time OBD Data */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Real-time OBD Data</h3>
                {(() => {
                  const vehicle = displayVehicles.find(v => v.id === selectedTrip.vehicleId);
                  const obdData = vehicle?.obdData;
                  const isConnected = getVehicleOBDStatus(selectedTrip.vehicleId);
                  
                  if (!isConnected) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">OBD Disconnected</span>
                        </div>
                        <p className="text-xs text-gray-500">No real-time data available</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">OBD Connected</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engine RPM</p>
                        <p className="font-medium">{Math.round(obdData?.engineRPM || 0)} RPM</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fuel Level</p>
                        <p className="font-medium">{Math.round(obdData?.fuelLevel || 0)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Battery</p>
                        <p className="font-medium">{obdData?.batteryVoltage.toFixed(1) || 0}V</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Speed</p>
                        <p className="font-medium">{Math.round(obdData?.vehicleSpeed || 0)} km/h</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {selectedTrip.aiOptimization && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">AI Optimization</h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Suggested Route</p>
                      <p className="font-medium">{selectedTrip.aiOptimization.suggestedRoute}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Savings</p>
                      <p className="font-medium">{selectedTrip.aiOptimization.estimatedSavings} L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Traffic Conditions</p>
                      <p className="font-medium">{selectedTrip.aiOptimization.trafficConditions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weather Impact</p>
                      <p className="font-medium">{selectedTrip.aiOptimization.weatherImpact}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 inline mr-2" />
                Export
              </button>
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-4 h-4 inline mr-2" />
                Share
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Trip
              </button>
            </div>
          </>
        )}
      </Modal>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new trip.</p>
        </div>
      )}
    </div>
  );
};

export default TripsPage; 