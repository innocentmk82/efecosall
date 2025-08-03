import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileText, Download, Filter, Calendar, Users, Car, TrendingUp, DollarSign } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { SkeletonCard } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';


const Reports: React.FC = () => {
  const { vehicles, drivers, fuelLogs, budgets, loading, error, refreshData } = useData();
  const [selectedReport, setSelectedReport] = useState('fuel-summary');
  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState('all');

  // Use real data from Firebase
  const displayVehicles = vehicles;
  const displayDrivers = drivers;

  const reportTypes = [
    {
      id: 'fuel-summary',
      title: 'Fuel Summary Report',
      description: 'Monthly fuel consumption and cost analysis',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'driver-performance',
      title: 'Driver Performance Report',
      description: 'Individual driver efficiency and behavior analysis',
      icon: Users,
      color: 'green'
    },
    {
      id: 'vehicle-efficiency',
      title: 'Vehicle Efficiency Report',
      description: 'Vehicle performance and maintenance insights',
      icon: Car,
      color: 'purple'
    },
    {
      id: 'budget-analysis',
      title: 'Budget Analysis Report',
      description: 'Budget vs actual spending comparison',
      icon: DollarSign,
      color: 'orange'
    },
    {
      id: 'anomaly-report',
      title: 'Anomaly Detection Report',
      description: 'Fuel usage anomalies and recommendations',
      icon: TrendingUp,
      color: 'red'
    },
    {
      id: 'route-optimization',
      title: 'Route Optimization Report',
      description: 'Route efficiency and optimization opportunities',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  const generateReport = () => {
    // TODO: Implement actual report generation
    console.log('Generating report:', {
      type: selectedReport,
      dateRange,
      department: selectedDepartment,
      vehicle: selectedVehicle,
      driver: selectedDriver
    });
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // TODO: Implement actual export functionality
    console.log('Exporting report as:', format);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports & Exports"
          description="Generate comprehensive reports and export data"
          icon={FileText}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          title="Reports & Exports"
          description="Generate comprehensive reports and export data"
          icon={FileText}
        />
        <ErrorMessage
          title="Failed to load reports data"
          message={error}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Exports"
        description="Generate comprehensive reports and export data"
        icon={FileText}
        actions={
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        }
      />

      {/* Report Type Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;
            
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? `border-${report.color}-500 bg-${report.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="operations">Operations</option>
              <option value="sales">Sales</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Vehicles</option>
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
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Drivers</option>
              {displayDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('pdf')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Report Preview</p>
            <p className="text-sm">Select filters and generate a report to see the preview here</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h3>
        <div className="space-y-4">
          {[
            { name: 'Fuel Summary - March 2024', type: 'PDF', date: '2024-03-15', size: '2.3 MB' },
            { name: 'Driver Performance - Q1 2024', type: 'Excel', date: '2024-03-10', size: '1.8 MB' },
            { name: 'Vehicle Efficiency - February 2024', type: 'PDF', date: '2024-03-05', size: '3.1 MB' },
            { name: 'Budget Analysis - Q4 2023', type: 'Excel', date: '2024-02-28', size: '2.7 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-500">{report.type} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{report.date}</span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports; 