import React, { useState } from 'react';
import { Fuel, AlertTriangle, Eye, Edit3, MapPin, Calendar, Plus, Trash2, Activity, Gauge, Battery, Wifi } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FuelLog } from '../../types';
import { useToast } from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingButton from '../common/LoadingButton';
import PageHeader from '../common/PageHeader';
import { SkeletonTable } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import SearchInput from '../common/SearchInput';


const TAG_OPTIONS = ['Business', 'Delivery', 'Maintenance', 'Other'];

const FuelLogsList: React.FC = () => {
  const { fuelLogs, vehicles, drivers, loading, error, addFuelLog, updateFuelLog, deleteFuelLog, getOBDData, refreshData } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterAnomalies, setFilterAnomalies] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    odometer: 0,
    liters: 0,
    cost: 0,
    location: '',
    tripDistance: 0,
    efficiency: 0,
    route: '',
    isAnomalous: false,
    anomalyReason: '',
    tag: ''
  });

  // Use real data from Firebase
  const displayFuelLogs = fuelLogs;
  const displayVehicles = vehicles;
  const displayDrivers = drivers;

  const filteredLogs = displayFuelLogs.filter(log => {
    const vehicle = displayVehicles.find(v => v.id === log.vehicleId);
    const driver = displayDrivers.find(d => d.id === log.driverId);
    
    const matchesSearch = 
      (vehicle?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.route.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVehicle = filterVehicle === 'all' || log.vehicleId === filterVehicle;
    const matchesAnomalies = filterAnomalies === 'all' || 
                           (filterAnomalies === 'anomalous' && log.isAnomalous) ||
                           (filterAnomalies === 'normal' && !log.isAnomalous);
    
    let matchesDate = true;
    if (dateFrom) matchesDate = matchesDate && log.date >= dateFrom;
    if (dateTo) matchesDate = matchesDate && log.date <= dateTo;

    let matchesTag = filterTag === 'all' || log.tag === filterTag;
    return matchesSearch && matchesVehicle && matchesAnomalies && matchesDate && matchesTag;
  });

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

  const getEfficiencyStatus = (efficiency: number, vehicleId: string) => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return { color: 'text-gray-600', label: 'Unknown' };
    
    const ratio = efficiency / vehicle.averageConsumption;
    if (ratio <= 1.1) return { color: 'text-green-600', label: 'Excellent' };
    if (ratio <= 1.3) return { color: 'text-blue-600', label: 'Good' };
    if (ratio <= 1.5) return { color: 'text-yellow-600', label: 'Average' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const handleAddFuelLog = async () => {
    setIsSubmitting(true);
    try {
      await addFuelLog(formData);
      setShowAddModal(false);
      setFormData({
        vehicleId: '',
        driverId: '',
        date: new Date().toISOString().split('T')[0],
        odometer: 0,
        liters: 0,
        cost: 0,
        location: '',
        tripDistance: 0,
        efficiency: 0,
        route: '',
        isAnomalous: false,
        anomalyReason: '',
        tag: ''
      });
    } catch (error) {
      console.error('Failed to add fuel log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFuelLog = async () => {
    if (!selectedLog) return;
    
    setIsSubmitting(true);
    try {
      await updateFuelLog(selectedLog.id, formData);
      setShowEditModal(false);
      setSelectedLog(null);
      setFormData({
        vehicleId: '',
        driverId: '',
        date: new Date().toISOString().split('T')[0],
        odometer: 0,
        liters: 0,
        cost: 0,
        location: '',
        tripDistance: 0,
        efficiency: 0,
        route: '',
        isAnomalous: false,
        anomalyReason: '',
        tag: ''
      });
    } catch (error) {
      console.error('Failed to update fuel log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFuelLog = async (id: string) => {
    setLogToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFuelLog = async () => {
    if (!logToDelete) return;
    
    try {
      await deleteFuelLog(logToDelete);
    } catch (error) {
      console.error('Failed to delete fuel log:', error);
    } finally {
      setShowDeleteDialog(false);
      setLogToDelete(null);
    }
  };

  const openEditModal = (log: FuelLog) => {
    setSelectedLog(log);
    setFormData({
      vehicleId: log.vehicleId,
      driverId: log.driverId,
      date: log.date,
      odometer: log.odometer,
      liters: log.liters,
      cost: log.cost,
      location: log.location,
      tripDistance: log.tripDistance,
      efficiency: log.efficiency,
      route: log.route,
      isAnomalous: log.isAnomalous,
      anomalyReason: log.anomalyReason || '',
      tag: log.tag || ''
    });
    setShowEditModal(true);
  };

  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fuel Logs & Trip Data"
          description="Track fuel consumption, monitor efficiency, and detect anomalies"
          icon={Fuel}
        />
        <SkeletonTable rows={8} columns={9} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fuel Logs & Trip Data"
          description="Track fuel consumption, monitor efficiency, and detect anomalies"
          icon={Fuel}
        />
        <ErrorMessage
          title="Failed to load fuel logs"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fuel Logs & Trip Data</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Fuel Entry
        </button>
      </div>

      {/* Real-time OBD Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time OBD Monitoring</h3>
            <p className="text-sm text-gray-600">Live vehicle data for fuel efficiency tracking</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayVehicles.map(vehicle => {
            const obdData = getVehicleOBDData(vehicle.id);
            const isConnected = getVehicleOBDStatus(vehicle.id);
            
            return (
              <div key={vehicle.id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">{vehicle.name}</span>
                </div>
                {isConnected && obdData ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel:</span>
                      <span className="font-medium">{Math.round(obdData.fuelLevel)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine:</span>
                      <span className="font-medium">{obdData.engineRPM > 0 ? 'ON' : 'OFF'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery:</span>
                      <span className="font-medium">{obdData.batteryVoltage.toFixed(1)}V</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    OBD Disconnected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Vehicle, driver, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anomalies</label>
            <select
              value={filterAnomalies}
              onChange={(e) => setFilterAnomalies(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Entries</option>
              <option value="normal">Normal Only</option>
              <option value="anomalous">Anomalies Only</option>
            </select>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Fuel className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              <p className="text-gray-600 text-sm">Total Entries</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.filter(log => log.isAnomalous).length}
              </p>
              <p className="text-gray-600 text-sm">Anomalies</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.reduce((sum, log) => sum + log.tripDistance, 0).toLocaleString()}km
              </p>
              <p className="text-gray-600 text-sm">Total Distance</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Fuel className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.reduce((sum, log) => sum + log.liters, 0).toFixed(0)}L
              </p>
              <p className="text-gray-600 text-sm">Total Fuel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver & Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel & Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OBD Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedLogs.map((log) => {
                const efficiencyStatus = getEfficiencyStatus(log.efficiency, log.vehicleId);
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(log.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{getVehicleName(log.vehicleId)}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getDriverName(log.driverId)}</p>
                        <p className="text-sm text-gray-600">{log.route}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.liters}L</p>
                        <p className="text-sm text-gray-600">E{log.cost}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.tripDistance}km</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-600 truncate max-w-32">{log.location}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const isConnected = getVehicleOBDStatus(log.vehicleId);
                        const obdData = getVehicleOBDData(log.vehicleId);
                        
                        return (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                              <span className="text-xs text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                              </span>
                              {isConnected && obdData && (
                                <div className="text-xs text-gray-500">
                                  {Math.round(obdData.fuelLevel)}% fuel
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${efficiencyStatus.color}`}>
                          {log.efficiency}L/100km
                        </p>
                        <p className={`text-xs ${efficiencyStatus.color}`}>
                          {efficiencyStatus.label}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.isAnomalous ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status="Anomaly" variant="error" size="sm" />
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                      ) : (
                        <StatusBadge status="Normal" variant="success" size="sm" />
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={log.tag} variant="info" size="sm" />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(log)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFuelLog(log.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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

      {/* Anomaly Details */}
      {filteredLogs.some(log => log.isAnomalous) && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Detected Anomalies Requiring Attention
          </h3>
          <div className="space-y-3">
            {filteredLogs.filter(log => log.isAnomalous).map(log => (
              <div key={log.id} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getVehicleName(log.vehicleId)} - {getDriverName(log.driverId)}
                    </p>
                    <p className="text-sm text-gray-600">{log.route} on {new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-sm text-red-700 mt-2">{log.anomalyReason}</p>
                  </div>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition-colors">
                    Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredLogs.length === 0 && (
        <EmptyState
          icon={Fuel}
          title="No fuel logs found"
          description="No fuel logs found matching your filters. Try adjusting your search criteria or add a new fuel entry."
          action={{
            label: "Add Fuel Entry",
            onClick: () => setShowAddModal(true)
          }}
        />
      )}

      {/* Add Fuel Log Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Fuel Entry"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vehicle</option>
                  {displayVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Driver</option>
                  {displayDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odometer Reading</label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({...formData, odometer: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Liters</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.liters}
                  onChange={(e) => setFormData({...formData, liters: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost (E)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tripDistance}
                  onChange={(e) => setFormData({...formData, tripDistance: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({...formData, route: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Efficiency (L/100km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.efficiency}
                  onChange={(e) => setFormData({...formData, efficiency: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                <select
                  value={formData.tag}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Tag</option>
                  {TAG_OPTIONS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleAddFuelLog}
                loading={isSubmitting}
                loadingText="Adding..."
                className="flex-1"
              >
                Add Entry
              </LoadingButton>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Edit Fuel Log Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Fuel Entry"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vehicle</option>
                  {displayVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Driver</option>
                  {displayDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odometer Reading</label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({...formData, odometer: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Liters</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.liters}
                  onChange={(e) => setFormData({...formData, liters: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost (E)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tripDistance}
                  onChange={(e) => setFormData({...formData, tripDistance: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                <input
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({...formData, route: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Efficiency (L/100km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.efficiency}
                  onChange={(e) => setFormData({...formData, efficiency: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Is Anomalous</label>
                <select
                  value={formData.isAnomalous ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, isAnomalous: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              {formData.isAnomalous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anomaly Reason</label>
                  <textarea
                    value={formData.anomalyReason}
                    onChange={(e) => setFormData({...formData, anomalyReason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                <select
                  value={formData.tag}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Tag</option>
                  {TAG_OPTIONS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleEditFuelLog}
                loading={isSubmitting}
                loadingText="Updating..."
                className="flex-1"
              >
                Update Entry
              </LoadingButton>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Fuel Log"
        message="Are you sure you want to delete this fuel log entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteFuelLog}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
};

export default FuelLogsList;