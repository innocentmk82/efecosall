import React, { useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, Plus, Settings as SettingsIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../context/DataContext';
import { getBudgetStatus } from '../../utils/calculations';
import { Budget } from '../../types';
import { useToast } from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingButton from '../common/LoadingButton';
import PageHeader from '../common/PageHeader';
import { SkeletonCard, SkeletonTable } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';


const BudgetManager: React.FC = () => {
  const { budgets, vehicles, drivers, loading, error, addBudget, updateBudget, deleteBudget, refreshData } = useData();
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    department: string;
    period: 'monthly' | 'weekly';
    monthlyLimit: number;
    weeklyLimit: number;
    alertThreshold: number;
    vehicleIds: string[];
    driverIds: string[];
  }>(
    {
      name: '',
      department: '',
      period: 'monthly',
      monthlyLimit: 0,
      weeklyLimit: 0,
      alertThreshold: 80,
      vehicleIds: [],
      driverIds: []
    }
  );

  // Use real data from Firebase
  const displayBudgets = budgets;
  const displayVehicles = vehicles;
  const displayDrivers = drivers;

  const budgetData = displayBudgets.map(budget => {
    const status = getBudgetStatus(budget.currentSpend, budget.monthlyLimit, budget.alertThreshold);
    return {
      ...budget,
      ...status,
      utilizationRate: (budget.currentSpend / budget.monthlyLimit) * 100
    };
  });

  const totalBudget = displayBudgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const totalSpend = displayBudgets.reduce((sum, budget) => sum + budget.currentSpend, 0);
  const overallStatus = getBudgetStatus(totalSpend, totalBudget);

  const departmentSpendData = budgetData.map(budget => ({
    department: budget.department,
    budget: budget.monthlyLimit,
    spent: budget.currentSpend,
    remaining: budget.remaining
  }));

  const alertBudgets = budgetData.filter(budget => budget.status !== 'good');
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const monthlyTrend = [
    { month: 'Aug', budget: totalBudget, actual: totalSpend - 500, variance: -500 },
    { month: 'Sep', budget: totalBudget, actual: totalSpend - 200, variance: -200 },
    { month: 'Oct', budget: totalBudget, actual: totalSpend + 100, variance: 100 },
    { month: 'Nov', budget: totalBudget, actual: totalSpend - 300, variance: -300 },
    { month: 'Dec', budget: totalBudget, actual: totalSpend, variance: 0 }
  ];

  const handleAddBudget = async () => {
    setIsSubmitting(true);
    try {
      await addBudget({
        ...formData,
        period: formData.period,
        weeklyLimit: formData.weeklyLimit || 0,
        driverIds: formData.driverIds || [],
        currentSpend: 0
      });
      setShowAddBudget(false);
      setFormData({
        name: '',
        department: '',
        period: 'monthly',
        monthlyLimit: 0,
        weeklyLimit: 0,
        alertThreshold: 80,
        vehicleIds: [],
        driverIds: []
      });
    } catch (error) {
      console.error('Failed to add budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBudget = async () => {
    if (!selectedBudget) return;
    setIsSubmitting(true);
    try {
      await updateBudget(selectedBudget.id, {
        ...formData,
        period: formData.period,
        weeklyLimit: formData.weeklyLimit || 0,
        driverIds: formData.driverIds || []
      });
      setShowEditBudget(false);
      setSelectedBudget(null);
      setFormData({
        name: '',
        department: '',
        period: 'monthly',
        monthlyLimit: 0,
        weeklyLimit: 0,
        alertThreshold: 80,
        vehicleIds: [],
        driverIds: []
      });
    } catch (error) {
      console.error('Failed to update budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setBudgetToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudget(budgetToDelete);
    } catch (error) {
      console.error('Failed to delete budget:', error);
    } finally {
      setShowDeleteDialog(false);
      setBudgetToDelete(null);
    }
  };

  const openEditModal = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      name: budget.name,
      department: budget.department,
      period: budget.period,
      monthlyLimit: budget.monthlyLimit,
      weeklyLimit: budget.weeklyLimit ?? 0,
      alertThreshold: budget.alertThreshold,
      vehicleIds: budget.vehicleIds,
      driverIds: budget.driverIds ?? []
    });
    setShowEditBudget(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Budget Management"
          description="Monitor spending, set limits, and track budget performance across departments"
          icon={DollarSign}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <SkeletonTable rows={6} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Budget Management"
          description="Monitor spending, set limits, and track budget performance across departments"
          icon={DollarSign}
        />
        <ErrorMessage
          title="Failed to load budgets"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Management"
        description="Monitor spending, set limits, and track budget performance across departments"
        icon={DollarSign}
        actions={
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="monthly">Monthly View</option>
              <option value="quarterly">Quarterly View</option>
              <option value="yearly">Yearly View</option>
            </select>
            <button 
              onClick={() => setShowAddBudget(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Budget
            </button>
          </div>
        }
      />

      {/* Overall Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className={`text-sm font-medium ${overallStatus.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              E{Math.abs(overallStatus.remaining).toLocaleString()}
            </span>
          </div>
          <h3 className="text-blue-800 text-sm font-medium">Total Budget</h3>
          <p className="text-2xl font-bold text-blue-900">E{totalBudget.toLocaleString()}</p>
          <p className="text-blue-700 text-sm">across all departments</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-green-600 text-sm font-medium">{overallStatus.percentage.toFixed(1)}%</span>
          </div>
          <h3 className="text-green-800 text-sm font-medium">Total Spent</h3>
          <p className="text-2xl font-bold text-green-900">E{totalSpend.toLocaleString()}</p>
          <p className="text-green-700 text-sm">of allocated budget</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-purple-600" />
            <span className="text-purple-600 text-sm font-medium">
              {overallStatus.remaining >= 0 ? '+' : '-'}E{Math.abs(overallStatus.remaining).toLocaleString()}
            </span>
          </div>
          <h3 className="text-purple-800 text-sm font-medium">Remaining</h3>
          <p className="text-2xl font-bold text-purple-900">
            E{Math.abs(overallStatus.remaining).toLocaleString()}
          </p>
          <p className="text-purple-700 text-sm">
            {overallStatus.remaining >= 0 ? 'under budget' : 'over budget'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-orange-600 text-sm font-medium">{alertBudgets.length}</span>
          </div>
          <h3 className="text-orange-800 text-sm font-medium">Alerts Active</h3>
          <p className="text-2xl font-bold text-orange-900">{alertBudgets.length}</p>
          <p className="text-orange-700 text-sm">departments need attention</p>
        </div>
      </div>

      {/* Budget Alerts */}
      {alertBudgets.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Budget Alerts & Warnings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertBudgets.map(budget => (
              <div key={budget.id} className={`p-4 rounded-lg border ${
                budget.status === 'critical' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      budget.status === 'critical' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {budget.name}
                    </h4>
                    <p className={`text-sm ${
                      budget.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {budget.utilizationRate.toFixed(1)}% of budget used
                    </p>
                    <p className={`text-xs mt-1 ${budget.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {budget.period === 'weekly'
                        ? `Weekly: E${budget.weeklyLimit?.toLocaleString()}`
                        : `Monthly: E${budget.monthlyLimit.toLocaleString()}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    budget.status === 'critical' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {budget.status === 'critical' ? 'Over Budget' : 'Warning'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Budget vs Spend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Budget vs Actual Spend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSpendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="budget" fill="#E5E7EB" name="Budget (E)" />
              <Bar dataKey="spent" fill="#3B82F6" name="Spent (E)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Spend Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentSpendData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, spent }) => `${department}: E${spent.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="spent"
              >
                {departmentSpendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
                          <Bar dataKey="budget" fill="#E5E7EB" name="Budget (E)" />
              <Bar dataKey="actual" fill="#3B82F6" name="Actual (E)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Details Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Department Budget Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Drivers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Threshold (%)</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayBudgets.map((budget) => (
                <tr key={budget.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{budget.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{budget.period === 'weekly' ? 'Weekly' : 'Monthly'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {budget.period === 'weekly' ? `E${budget.weeklyLimit?.toLocaleString()}` : `E${budget.monthlyLimit.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">E{budget.currentSpend.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {budget.vehicleIds.map(id => {
                      const v = displayVehicles.find(v => v.id === id);
                      return v ? v.name : id;
                    }).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {budget.driverIds && budget.driverIds.length > 0
                      ? budget.driverIds.map(id => {
                          const d = displayDrivers.find(d => d.id === id);
                          return d ? d.name : id;
                        }).join(', ')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{budget.alertThreshold}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button 
                        onClick={() => openEditModal(budget)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteBudget}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />

      {/* Add Budget Modal */}
      <Modal
        isOpen={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        title="Add New Budget"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              {formData.period === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit ($)</label>
                  <input
                    type="number"
                    value={formData.monthlyLimit}
                    onChange={e => setFormData({ ...formData, monthlyLimit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              {formData.period === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Limit ($)</label>
                  <input
                    type="number"
                    value={formData.weeklyLimit}
                    onChange={e => setFormData({ ...formData, weeklyLimit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Vehicles</label>
                <select
                  multiple
                  value={formData.vehicleIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, vehicleIds: selectedOptions});
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Drivers</label>
                <select
                  multiple
                  value={formData.driverIds}
                  onChange={e => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, driverIds: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {displayDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleAddBudget}
                loading={isSubmitting}
                loadingText="Creating..."
                className="flex-1"
              >
                Add Budget
              </LoadingButton>
              <button
                onClick={() => setShowAddBudget(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={showEditBudget}
        onClose={() => setShowEditBudget(false)}
        title="Edit Budget"
        size="md"
      >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              {formData.period === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit (E)</label>
                  <input
                    type="number"
                    value={formData.monthlyLimit}
                    onChange={e => setFormData({ ...formData, monthlyLimit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              {formData.period === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Limit (E)</label>
                  <input
                    type="number"
                    value={formData.weeklyLimit}
                    onChange={e => setFormData({ ...formData, weeklyLimit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Vehicles</label>
                <select
                  multiple
                  value={formData.vehicleIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, vehicleIds: selectedOptions});
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Drivers</label>
                <select
                  multiple
                  value={formData.driverIds}
                  onChange={e => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, driverIds: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {displayDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <LoadingButton
                onClick={handleEditBudget}
                loading={isSubmitting}
                loadingText="Updating..."
                className="flex-1"
              >
                Update Budget
              </LoadingButton>
              <button
                onClick={() => setShowEditBudget(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
      </Modal>
    </div>
  );
};

export default BudgetManager;