import React, { useState } from 'react';
import { Users, Edit3, Eye, Award, TrendingUp, Plus, Trash2, Wifi, Phone, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Driver } from '../../types';
import { useToast } from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingButton from '../common/LoadingButton';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import SearchInput from '../common/SearchInput';
import Modal from '../common/Modal';


const DriverList: React.FC = () => {
  const { drivers, vehicles, loading, error, addDriver, updateDriver, deleteDriver, regenerateDriverPassword, refreshData } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    department: '',
    assignedVehicles: [] as string[],
    obdDeviceId: '',
    phoneNumber: '',
    emergencyContact: ''
  });
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Use real data from Firebase
  const displayDrivers = drivers;
  const displayVehicles = vehicles;

  const filteredDrivers = displayDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (driver.obdDeviceId && driver.obdDeviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = filterDepartment === 'all' || driver.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getEfficiencyBadge = (score: number) => {
    const safeScore = score || 0;
    if (safeScore >= 90) return { color: 'bg-green-100 text-green-800', label: 'Excellent', icon: '🏆' };
    if (safeScore >= 80) return { color: 'bg-blue-100 text-blue-800', label: 'Good', icon: '⭐' };
    if (safeScore >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'Average', icon: '👍' };
    return { color: 'bg-red-100 text-red-800', label: 'Needs Improvement', icon: '⚠️' };
  };

  const getAssignedVehicleNames = (vehicleIds: string[]) => {
    return vehicleIds.map(id => {
      const vehicle = displayVehicles.find(v => v.id === id);
      return vehicle ? vehicle.name : 'Unknown';
    }).join(', ');
  };

  const handleAddDriver = async () => {
    setIsSubmitting(true);
    try {
      await addDriver({
        ...formData,
        efficiencyScore: 85, // Default score
        totalTrips: 0,
        totalDistance: 0,
        totalFuelUsed: 0,
        joinDate: new Date().toISOString().split('T')[0]
      });
      
      // Refresh data to get the updated drivers list
      await refreshData();
      
      // Find the newly added driver to get the temporal password
      const newDriver = drivers.find(d => d.name === formData.name && d.email === formData.email);
      if (newDriver?.temporalPassword) {
        setGeneratedPassword(newDriver.temporalPassword);
        setShowPasswordModal(true);
      }
      
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        licenseNumber: '',
        department: '',
        assignedVehicles: [],
        obdDeviceId: '',
        phoneNumber: '',
        emergencyContact: ''
      });
      addToast({
        type: 'success',
        title: 'Driver added successfully',
        message: 'The driver has been registered and can now access the mobile app'
      });
    } catch (error: any) {
      console.error('Failed to add driver:', error);
      addToast({
        type: 'error',
        title: 'Failed to add driver',
        message: error.message || 'An error occurred while adding the driver'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) return;
    
    setIsSubmitting(true);
    try {
      await updateDriver(selectedDriver.id, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      setFormData({
        name: '',
        email: '',
        licenseNumber: '',
        department: '',
        assignedVehicles: [],
        obdDeviceId: '',
        phoneNumber: '',
        emergencyContact: ''
      });
      addToast({
        type: 'success',
        title: 'Driver updated successfully',
        message: 'The driver information has been updated'
      });
    } catch (error: any) {
      console.error('Failed to update driver:', error);
      addToast({
        type: 'error',
        title: 'Failed to update driver',
        message: error.message || 'An error occurred while updating the driver'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    setDriverToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      await deleteDriver(driverToDelete);
      addToast({
        type: 'success',
        title: 'Driver deleted successfully',
        message: 'The driver has been removed from the system'
      });
    } catch (error: any) {
      console.error('Failed to delete driver:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete driver',
        message: error.message || 'An error occurred while deleting the driver'
      });
    } finally {
      setShowDeleteDialog(false);
      setDriverToDelete(null);
    }
  };

  const handleRegeneratePassword = async (driverId: string) => {
    try {
      const newPassword = await regenerateDriverPassword(driverId);
      setGeneratedPassword(newPassword);
      setShowPasswordModal(true);
      addToast({
        type: 'success',
        title: 'Password regenerated',
        message: 'A new password has been generated for the driver'
      });
    } catch (error: any) {
      console.error('Failed to regenerate password:', error);
      addToast({
        type: 'error',
        title: 'Failed to regenerate password',
        message: error.message || 'An error occurred while regenerating the password'
      });
    }
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      department: driver.department,
      assignedVehicles: driver.assignedVehicles,
      obdDeviceId: driver.obdDeviceId || '',
      phoneNumber: driver.phoneNumber || '',
      emergencyContact: driver.emergencyContact || ''
    });
    setShowEditModal(true);
  };

  const sortedDrivers = [...filteredDrivers].sort((a, b) => (b.efficiencyScore || 0) - (a.efficiencyScore || 0));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Driver Management"
          description="Manage your fleet drivers, track performance, and assign vehicles"
          icon={Users}
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
          title="Driver Management"
          description="Manage your fleet drivers, track performance, and assign vehicles"
          icon={Users}
        />
        <ErrorMessage
          title="Failed to load drivers"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Management"
        description="Manage your fleet drivers, track performance, and assign vehicles"
        icon={Users}
        actions={
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Driver
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Drivers</label>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, license, or OBD device..."
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
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Top Performers This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedDrivers.slice(0, 3).map((driver, index) => {
            const badge = getEfficiencyBadge(driver.efficiencyScore);
            const medals = ['🥇', '🥈', '🥉'];
            
            return (
              <div key={driver.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{medals[index]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                    <p className="text-gray-600 text-sm">{driver.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                                      <span className="text-2xl font-bold text-green-600">{driver.efficiencyScore || 0}%</span>
                  <span className="text-sm text-gray-600">efficiency</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedDrivers.map((driver, index) => {
          const badge = getEfficiencyBadge(driver.efficiencyScore);
                            const avgEfficiency = (driver.totalFuelUsed > 0 && driver.totalDistance > 0) ? (driver.totalFuelUsed / driver.totalDistance) * 100 : 0;

          return (
            <div key={driver.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-gray-600 text-sm">{driver.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-lg">{badge.icon}</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Rank</p>
                    <p className="font-bold text-lg">#{index + 1}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Email</span>
                  <span className="font-medium text-sm">{driver.email}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">License</span>
                  <span className="font-medium">{driver.licenseNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Efficiency Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{driver.efficiencyScore || 0}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* OBD Device Info */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    OBD Device
                  </span>
                  <span className="font-medium text-sm">
                    {driver.obdDeviceId || 'Not Connected'}
                  </span>
                </div>

                {/* Phone Number */}
                {driver.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </span>
                    <span className="font-medium text-sm">{driver.phoneNumber}</span>
                  </div>
                )}

                {/* Temporal Password */}
                {driver.temporalPassword && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Mobile Password
                    </span>
                    <span className="font-medium text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {driver.temporalPassword}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Trips</p>
                    <p className="font-semibold text-lg">{driver.totalTrips || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Distance</p>
                    <p className="font-semibold text-lg">{(driver.totalDistance || 0).toLocaleString()}km</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Fuel Used</p>
                    <p className="font-semibold text-lg">{driver.totalFuelUsed || 0}L</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Efficiency</p>
                    <p className="font-semibold text-lg">{(avgEfficiency || 0).toFixed(1)}L/100km</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Assigned Vehicles</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {getAssignedVehicleNames(driver.assignedVehicles) || 'No vehicles assigned'}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button 
                  onClick={() => openEditModal(driver)}
                  className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleRegeneratePassword(driver.id)}
                  className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  New Password
                </button>
                <button 
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No drivers found matching your filters.</p>
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Driver"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Vehicles</label>
                <select
                  multiple
                  value={formData.assignedVehicles}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, assignedVehicles: selectedOptions});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {displayVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+268 1234 5678"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact (Optional)</label>
                <input
                  type="text"
                  placeholder="Name - Phone Number"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleAddDriver}
                loading={isSubmitting}
                loadingText="Adding..."
                className="flex-1"
              >
                Add Driver
              </LoadingButton>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Driver"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Vehicles</label>
                <select
                  multiple
                  value={formData.assignedVehicles}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, assignedVehicles: selectedOptions});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {displayVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+268 1234 5678"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact (Optional)</label>
                <input
                  type="text"
                  placeholder="Name - Phone Number"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleEditDriver}
                loading={isSubmitting}
                loadingText="Updating..."
                className="flex-1"
              >
                Update Driver
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
        title="Delete Driver"
        message="Are you sure you want to delete this driver? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteDriver}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />

      {/* Temporal Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={generatedPassword ? "Temporal Password Generated" : "Driver Added Successfully"}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800">
                {generatedPassword ? "Password Regenerated" : "Driver Account Created"}
              </h3>
            </div>
            <p className="text-green-700 text-sm mb-4">
              {generatedPassword 
                ? "The temporal password has been successfully regenerated for the driver."
                : "The driver has been successfully added to your fleet and can now log in to the mobile application."
              }
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Mobile App Login Credentials</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
                <div className="bg-white px-3 py-2 rounded border text-sm font-mono">
                  {generatedPassword ? selectedDriver?.email || formData.email : formData.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Temporal Password</label>
                <div className="bg-white px-3 py-2 rounded border text-sm font-mono font-bold text-lg tracking-wider">
                  {generatedPassword}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This password is valid for mobile app login. The driver should change it after first login.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Share these credentials securely with the driver</li>
              <li>• The driver can log in to the mobile app using these credentials</li>
              <li>• The driver account is created in Firebase Authentication</li>
              <li>• The driver account is created in both 'drivers' and 'users' collections</li>
              <li>• User type is set to 'driver' for mobile app authentication</li>
              <li>• The driver can now authenticate with the mobile app</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowPasswordModal(false)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DriverList;