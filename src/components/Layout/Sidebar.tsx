import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Car, 
  Users, 
  Fuel, 
  TrendingUp, 
  DollarSign, 
  Route, 
  FileText,
  Settings,
  AlertTriangle,
  MapPin,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../common/ToastContainer';
import { useDebouncedNavigation } from '../../hooks/useDebounce';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, business, user } = useAuth();
  const { obdAlerts, loading } = useData();
  const { addToast } = useToast();
  const { debouncedNavigate, isNavigating } = useDebouncedNavigation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'vehicles', label: 'Vehicles', icon: Car, path: '/vehicles' },
    { id: 'drivers', label: 'Drivers', icon: Users, path: '/drivers' },
    { id: 'fuel-logs', label: 'Fuel Logs', icon: Fuel, path: '/fuel-logs' },
    { id: 'trips', label: 'Trips', icon: MapPin, path: '/trips' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' },
    { id: 'budgets', label: 'Budgets', icon: DollarSign, path: '/budgets' },
    { id: 'routes', label: 'Route History', icon: Route, path: '/routes' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavigation = useCallback((path: string) => {
    if (isNavigating) return;
    debouncedNavigate(navigate, path);
  }, [navigate, debouncedNavigate, isNavigating]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        type: 'success',
        title: 'Logged Out',
        message: 'You have been successfully logged out.'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      addToast({
        type: 'error',
        title: 'Logout Failed',
        message: 'An error occurred while logging out.'
      });
    }
  };

  const activeAlerts = obdAlerts?.filter(alert => !alert.isResolved) || [];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 z-10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">E-FECOS</h1>
            <p className="text-slate-400 text-xs">Fuel Efficiency System</p>
          </div>
        </div>
        
        {/* Business Info */}
        {business && (
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">{business.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                business.subscriptionStatus === 'active' ? 'bg-green-500' : 
                business.subscriptionStatus === 'trial' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-slate-400 capitalize">
                {business.subscriptionStatus} Plan
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="px-6 py-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Active Alerts</span>
            </div>
            <p className="text-slate-300 text-xs">
              {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''} need{activeAlerts.length === 1 ? 's' : ''} attention
            </p>
            <button
              onClick={() => navigate('/vehicles')}
              className="text-orange-400 text-xs hover:text-orange-300 mt-2 underline"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* User Info & Logout */}
      <div className="p-6 border-t border-slate-700">
        {user && (
          <div className="mb-4">
            <p className="text-slate-300 text-sm">{user.email}</p>
            <p className="text-slate-400 text-xs">
              Last login: {new Date().toLocaleDateString()}
            </p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;