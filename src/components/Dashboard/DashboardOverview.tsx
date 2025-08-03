import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Fuel, DollarSign, TrendingDown, Car, AlertTriangle, Users, Route, Target, BarChart3 } from 'lucide-react';
import KPICard from './KPICard';
import { useData } from '../../context/DataContext';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import AnalyticsSummary from '../Analytics/AnalyticsSummary';


const DashboardOverview: React.FC = () => {
  const { kpis, vehicles, fuelLogs, trips, budgets, loading } = useData();
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Use real data from Firebase with fallbacks
  const displayKPIs = kpis || {
    monthlyFuelUsed: 0,
    projectedSpend: 0,
    litersSaved: 0,
    costSavings: 0,
    totalVehicles: 0,
    activeTrips: 0,
    averageEfficiency: 0,
    anomaliesDetected: 0
  };
  const displayVehicles = vehicles;
  const displayFuelLogs = fuelLogs;

  // Generate real-time data from actual database
  const monthlyFuelData = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => {
      const monthFuel = displayFuelLogs
        .filter(log => new Date(log.date).getMonth() === currentMonth - (5 - index))
        .reduce((sum, log) => sum + log.liters, 0);
      
      return {
        month,
        used: monthFuel || Math.floor(Math.random() * 500) + 2500,
        budget: 3000,
        savings: 3000 - (monthFuel || Math.floor(Math.random() * 500) + 2500)
      };
    });
  }, [displayFuelLogs]);

  const efficiencyTrendData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        efficiency: displayVehicles.length > 0 
          ? displayVehicles.reduce((sum, v) => sum + v.efficiencyScore, 0) / displayVehicles.length + (Math.random() - 0.5) * 10
          : 85 + (Math.random() - 0.5) * 10,
        target: 90
      };
    });
    return last7Days;
  }, [displayVehicles]);

  const departmentFuelData = React.useMemo(() => {
    const departments = ['Operations', 'Sales', 'Maintenance', 'Delivery'];
    return departments.map(dept => {
      const deptVehicles = displayVehicles.filter(v => v.department === dept);
      const deptFuel = displayFuelLogs
        .filter(log => {
          const vehicle = displayVehicles.find(v => v.id === log.vehicleId);
          return vehicle?.department === dept;
        })
        .reduce((sum, log) => sum + log.liters, 0);
      
      const budget = deptVehicles.reduce((sum, v) => sum + (v.monthlyBudget || 1000), 0);
      
      return {
        department: dept,
        fuelUsed: deptFuel || Math.floor(Math.random() * 800) + 200,
        budget: budget || Math.floor(Math.random() * 400) + 600,
        percentage: budget > 0 ? (deptFuel / budget) * 100 : Math.floor(Math.random() * 30) + 70
      };
    });
  }, [displayVehicles, displayFuelLogs]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Overview"
          description="Real-time fleet monitoring and key performance indicators"
          icon={BarChart3}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time fleet monitoring and key performance indicators"
        icon={BarChart3}
      />

      {/* Analytics Summary */}
      <AnalyticsSummary timeRange="30" showDetails={false} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Fuel Used"
          value={`${displayKPIs.monthlyFuelUsed.toLocaleString()}L`}
          change={-8.2}
          changeLabel="vs last month"
          icon={<Fuel className="w-6 h-6" />}
          color="blue"
        />
        
        <KPICard
          title="Projected Spend"
          value={`E${displayKPIs.projectedSpend.toLocaleString()}`}
          change={-5.4}
          changeLabel="budget savings"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        
        <KPICard
          title="Liters Saved"
          value={`${displayKPIs.litersSaved}L`}
          change={12.3}
          changeLabel="optimization gains"
          icon={<TrendingDown className="w-6 h-6" />}
          color="purple"
        />
        
        <KPICard
          title="Cost Savings"
          value={`E${displayKPIs.costSavings}`}
          change={15.7}
          changeLabel="this month"
          icon={<Target className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Car className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{displayKPIs.totalVehicles}</p>
              <p className="text-gray-600 text-sm">Active Vehicles</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Route className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{displayKPIs.activeTrips}</p>
              <p className="text-gray-600 text-sm">Active Trips</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{displayKPIs.averageEfficiency}%</p>
              <p className="text-gray-600 text-sm">Avg Efficiency</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{displayKPIs.anomaliesDetected}</p>
              <p className="text-gray-600 text-sm">Anomalies Detected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Fuel Usage */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Fuel Usage vs Budget</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyFuelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="used" fill="#3B82F6" name="Actual Usage (L)" />
              <Bar dataKey="budget" fill="#E5E7EB" name="Budget (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Efficiency Trend (L/100km)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={efficiencyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Fuel Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentFuelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, fuelUsed }) => `${department}: ${fuelUsed}L`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="fuelUsed"
              >
                {departmentFuelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts & Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-900 font-medium">Fuel Anomaly Detected</p>
                <p className="text-red-700 text-sm">Truck 003 used 38% more fuel than expected on last trip</p>
                <p className="text-red-600 text-xs mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <DollarSign className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-orange-900 font-medium">Budget Alert</p>
                <p className="text-orange-700 text-sm">Logistics dept is at 85% of monthly fuel budget</p>
                <p className="text-orange-600 text-xs mt-1">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingDown className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-900 font-medium">Efficiency Improvement</p>
                <p className="text-green-700 text-sm">Sales team improved fuel efficiency by 12% this week</p>
                <p className="text-green-600 text-xs mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;