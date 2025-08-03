import React, { useState } from 'react';
import { Car, Edit3, Eye, AlertTriangle, TrendingUp, TrendingDown, Plus, Trash2, Wifi, User, Users, Activity, Gauge, Battery } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getBudgetStatus } from '../../utils/calculations';
import { Vehicle } from '../../types';
import OBDMonitor from './OBDMonitor';
import OBDAlerts from './OBDAlerts';
import { useToast } from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingButton from '../common/LoadingButton';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import SearchInput from '../common/SearchInput';
import Modal from '../common/Modal';


const VehicleList: React.FC = () => {
  const { vehicles, drivers, loading, error, addVehicle, updateVehicle, deleteVehicle, obdAlerts, refreshData } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    tankCapacity: '',
    averageConsumption: '',
    department: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
    monthlyBudget: '',
    obdDeviceId: '',
    assignedDriverId: ''
  });

  // Use real data from Firebase
  const displayVehicles = vehicles;
  const displayDrivers = drivers;
  const displayOBDAlerts = obdAlerts;

  const filteredVehicles = displayVehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.obdDeviceId && vehicle.obdDeviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = filterDepartment === 'all' || vehicle.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getEfficiencyBadge = (score: number) => {
    const safeScore = score || 0;
    if (safeScore >= 90) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (safeScore >= 80) return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
    if (safeScore >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'Average' };
    return { color: 'bg-red-100 text-red-800', label: 'Poor' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'maintenance': return { color: 'bg-orange-100 text-orange-800', label: 'Maintenance' };
      case 'inactive': return { color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
      default: return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const getAssignedDriverName = (driverId?: string) => {
    if (!driverId) return 'Unassigned';
    const driver = displayDrivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const getOBDAlerts = (vehicleId: string) => {
    return displayOBDAlerts.filter(alert => alert.vehicleId === vehicleId && !alert.isResolved);
  };

  const handleAddVehicle = async () => {
    setIsSubmitting(true);
    try {
      await addVehicle({
        ...formData,
        tankCapacity: parseFloat(formData.tankCapacity) || 0,
        averageConsumption: parseFloat(formData.averageConsumption) || 0,
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
        efficiencyScore: 85, // Default score
        currentSpend: 0
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        tankCapacity: '',
        averageConsumption: '',
        department: '',
        status: 'active',
        monthlyBudget: '',
        obdDeviceId: '',
        assignedDriverId: ''
      });
      addToast({
        type: 'success',
        title: 'Vehicle added successfully',
        message: 'The vehicle has been registered in the system'
      });
    } catch (error: any) {
      console.error('Failed to add vehicle:', error);
      addToast({
        type: 'error',
        title: 'Failed to add vehicle',
        message: error.message || 'An error occurred while adding the vehicle'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      await updateVehicle(selectedVehicle.id, {
        ...formData,
        tankCapacity: parseFloat(formData.tankCapacity) || 0,
        averageConsumption: parseFloat(formData.averageConsumption) || 0,
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
      });
      setShowEditModal(false);
      setSelectedVehicle(null);
      setFormData({
        name: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        tankCapacity: '',
        averageConsumption: '',
        department: '',
        status: 'active',
        monthlyBudget: '',
        obdDeviceId: '',
        assignedDriverId: ''
      });
      addToast({
        type: 'success',
        title: 'Vehicle updated successfully',
        message: 'The vehicle information has been updated'
      });
    } catch (error: any) {
      console.error('Failed to update vehicle:', error);
      addToast({
        type: 'error',
        title: 'Failed to update vehicle',
        message: error.message || 'An error occurred while updating the vehicle'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    setVehicleToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await deleteVehicle(vehicleToDelete);
      addToast({
        type: 'success',
        title: 'Vehicle deleted successfully',
        message: 'The vehicle has been removed from the system'
      });
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete vehicle',
        message: error.message || 'An error occurred while deleting the vehicle'
      });
    } finally {
      setShowDeleteDialog(false);
      setVehicleToDelete(null);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      plateNumber: vehicle.plateNumber,
      tankCapacity: vehicle.tankCapacity.toString(),
      averageConsumption: vehicle.averageConsumption.toString(),
      department: vehicle.department,
      status: vehicle.status,
      monthlyBudget: vehicle.monthlyBudget.toString(),
      obdDeviceId: vehicle.obdDeviceId || '',
      assignedDriverId: vehicle.assignedDriverId || ''
    });
    setShowEditModal(true);
  };

  const openAssignModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      ...formData,
      assignedDriverId: vehicle.assignedDriverId || ''
    });
    setShowAssignModal(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedVehicle) return;
    
    try {
      await updateVehicle(selectedVehicle.id, { assignedDriverId: formData.assignedDriverId });
      setShowAssignModal(false);
      setSelectedVehicle(null);
      addToast({
        type: 'success',
        title: 'Driver assigned successfully',
        message: 'The driver has been assigned to the vehicle'
      });
    } catch (error: any) {
      console.error('Failed to assign driver:', error);
      addToast({
        type: 'error',
        title: 'Failed to assign driver',
        message: error.message || 'An error occurred while assigning the driver'
      });
    }
  };

  const handleConnectOBD = async (vehicleId: string, deviceId: string) => {
    try {
      await updateVehicle(vehicleId, { obdDeviceId: deviceId });
    } catch (error) {
      console.error('Failed to connect OBD device:', error);
    }
  };

  const handleDisconnectOBD = async (vehicleId: string) => {
    try {
      await updateVehicle(vehicleId, { obdDeviceId: '' });
    } catch (error) {
      console.error('Failed to disconnect OBD device:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Management"
          description="Manage your fleet vehicles, monitor OBD data, and track performance"
          icon={Car}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Management"
          description="Manage your fleet vehicles, monitor OBD data, and track performance"
          icon={Car}
        />
        <ErrorMessage
          title="Failed to load vehicles"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Management"
        description="Manage your fleet vehicles, monitor OBD data, and track performance"
        icon={Car}
        actions={
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register New Vehicle
          </button>
        }
      />

      {/* OBD Dashboard Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">OBD-II Fleet Monitoring</h3>
            <p className="text-sm text-gray-600">Real-time vehicle diagnostics and alerts</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Connected Devices</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {displayVehicles.filter(v => v.obdData?.isConnected).length || 0}
            </span>
            <span className="text-sm text-gray-600">/ {displayVehicles.length} vehicles</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Active Alerts</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {displayOBDAlerts.reduce((total, v) => total + getOBDAlerts(v.vehicleId).length, 0) || 0}
            </span>
            <span className="text-sm text-gray-600">alerts</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Avg Efficiency</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {displayVehicles.length > 0 
                ? (Math.round(displayVehicles.reduce((sum, v) => sum + (v.obdData?.fuelConsumption || v.averageConsumption || 0), 0) / displayVehicles.length * 10) / 10) || 0
                : 0
              }
            </span>
            <span className="text-sm text-gray-600">L/100km</span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Battery</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {displayVehicles.length > 0 
                ? (Math.round(displayVehicles.reduce((sum, v) => sum + (v.obdData?.batteryVoltage || 0), 0) / (displayVehicles.filter(v => v.obdData?.batteryVoltage).length || 1) * 10) / 10) || 0
                : 0
              }
            </span>
            <span className="text-sm text-gray-600">V</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Vehicles</label>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, model, plate, or OBD ID..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const budgetStatus = getBudgetStatus(vehicle.currentSpend, vehicle.monthlyBudget);
          const efficiencyBadge = getEfficiencyBadge(vehicle.efficiencyScore);
          const statusBadge = getStatusBadge(vehicle.status);
          const assignedDriver = getAssignedDriverName(vehicle.assignedDriverId);

          return (
            <div key={vehicle.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                    <p className="text-gray-600 text-sm">{vehicle.model} ({vehicle.year})</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openEditModal(vehicle)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Plate Number</span>
                  <span className="font-medium">{vehicle.plateNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Department</span>
                  <span className="font-medium">{vehicle.department}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Efficiency Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{vehicle.efficiencyScore || 0}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${efficiencyBadge.color}`}>
                      {efficiencyBadge.label}
                    </span>
                  </div>
                </div>

                {/* OBD Device Info */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    OBD Device
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {vehicle.obdDeviceId || 'Not Connected'}
                    </span>
                    {vehicle.obdData?.isConnected && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* OBD Status Indicators */}
                {vehicle.obdData && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-gray-600">
                        {(vehicle.obdData.engineRPM || 0) > 0 ? 'Running' : 'Stopped'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">
                        {Math.round(vehicle.obdData.fuelLevel || 0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-gray-600">
                        {(vehicle.obdData.batteryVoltage || 0).toFixed(1)}V
                      </span>
                    </div>
                  </div>
                )}

                {/* Assigned Driver */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Assigned Driver
                  </span>
                  <span className="font-medium text-sm">
                    {assignedDriver}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Monthly Budget</span>
                  <span className="font-medium">E{vehicle.monthlyBudget || 0}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Current Spend</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">E{vehicle.currentSpend || 0}</span>
                    {budgetStatus.status === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                    {budgetStatus.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      budgetStatus.status === 'critical' ? 'bg-red-500' :
                      budgetStatus.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetStatus.percentage || 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(budgetStatus.percentage || 0).toFixed(1)}% of budget used
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tank Capacity</p>
                    <p className="font-medium">{vehicle.tankCapacity || 0}L</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Consumption</p>
                    <p className="font-medium">{vehicle.averageConsumption || 0}L/100km</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => openAssignModal(vehicle)}
                  className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Assign Driver
                </button>
                <button 
                  onClick={() => handleConnectOBD(vehicle.id, `OBD-${vehicle.id.padStart(3, '0')}`)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Wifi className="w-4 h-4" />
                  {vehicle.obdDeviceId ? 'Reconnect OBD' : 'Connect OBD'}
                </button>
              </div>

              {/* OBD Monitor */}
              <div className="mt-4">
                <OBDMonitor 
                  vehicle={vehicle}
                  onConnectOBD={(deviceId) => handleConnectOBD(vehicle.id, deviceId)}
                  onDisconnectOBD={() => handleDisconnectOBD(vehicle.id)}
                />
              </div>

              {/* OBD Alerts */}
              <div className="mt-4">
                <OBDAlerts 
                  alerts={displayOBDAlerts.filter(alert => alert.vehicleId === vehicle.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No vehicles found matching your filters.</p>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Vehicle"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OBD-II Device ID (Optional)</label>
                <input
                  type="text"
                  placeholder="OBD-001"
                  value={formData.obdDeviceId}
                  onChange={(e) => setFormData({...formData, obdDeviceId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tank Capacity (L)</label>
                <input
                  type="number"
                  value={formData.tankCapacity}
                  onChange={(e) => setFormData({...formData, tankCapacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Consumption (L/100km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.averageConsumption}
                  onChange={(e) => setFormData({...formData, averageConsumption: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (E)</label>
                <input
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({...formData, monthlyBudget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleAddVehicle}
                loading={isSubmitting}
                loadingText="Registering..."
                className="flex-1"
              >
                Register Vehicle
              </LoadingButton>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vehicle"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OBD-II Device ID</label>
                <input
                  type="text"
                  placeholder="OBD-001"
                  value={formData.obdDeviceId}
                  onChange={(e) => setFormData({...formData, obdDeviceId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tank Capacity (L)</label>
                <input
                  type="number"
                  value={formData.tankCapacity}
                  onChange={(e) => setFormData({...formData, tankCapacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Consumption (L/100km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.averageConsumption}
                  onChange={(e) => setFormData({...formData, averageConsumption: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (E)</label>
                <input
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({...formData, monthlyBudget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleEditVehicle}
                loading={isSubmitting}
                loadingText="Updating..."
                className="flex-1"
              >
                Update Vehicle
              </LoadingButton>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Driver to Vehicle"
        size="sm"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver</label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({...formData, assignedDriverId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {displayDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAssignDriver}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Assign Driver
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteVehicle}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
};

export default VehicleList;