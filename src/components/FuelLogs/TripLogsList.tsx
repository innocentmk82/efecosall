import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Calendar, Car, User, Route, Fuel, DollarSign } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { SkeletonTable } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import SearchInput from '../common/SearchInput';


const TAG_OPTIONS = ['Business', 'Delivery', 'Maintenance', 'Other'];

const TripLogsList: React.FC = () => {
  const { trips, vehicles, drivers, loading, error, refreshData } = useData();
  const [filterTag, setFilterTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use real data from Firebase
  const displayTrips = trips;
  const displayVehicles = vehicles;
  const displayDrivers = drivers;

  const filteredTrips = displayTrips.filter(trip => {
    const vehicle = displayVehicles.find(v => v.id === trip.vehicleId);
    const driver = displayDrivers.find(d => d.id === trip.driverId);
    const matchesSearch =
      (vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = filterTag === 'all' || trip.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  const getVehicleName = (vehicleId: string) => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const getDriverName = (driverId: string) => {
    const driver = displayDrivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Trip Logs"
          description="View and analyze completed trip data and performance metrics"
          icon={MapPin}
        />
        <SkeletonTable rows={8} columns={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Trip Logs"
          description="View and analyze completed trip data and performance metrics"
          icon={MapPin}
        />
        <ErrorMessage
          title="Failed to load trip logs"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Logs"
        description="View and analyze completed trip data and performance metrics"
        icon={MapPin}
      />
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Vehicle, driver, location..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tags</option>
              {TAG_OPTIONS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Trip Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance (km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Used (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency (L/100km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trip.startTime ? new Date(trip.startTime).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getVehicleName(trip.vehicleId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getDriverName(trip.driverId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.startLocation} → {trip.endLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.distance}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.fuelUsed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trip.efficiency || ((trip.fuelUsed && trip.distance) ? ((trip.fuelUsed / trip.distance) * 100).toFixed(1) : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {trip.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500">No trips found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default TripLogsList;