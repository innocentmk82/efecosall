import React, { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import RouterProvider from './components/common/RouterProvider';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/Layout/AppLayout';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import VehicleList from './components/Vehicles/VehicleList';
import DriverList from './components/Drivers/DriverList';
import FuelLogsList from './components/FuelLogs/FuelLogsList';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import BudgetManager from './components/Budgets/BudgetManager';
import RouteOptimization from './components/Routes/RouteOptimization';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import Login from './components/Login';
import BusinessRegistration from './components/BusinessRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import TripLogsList from './components/FuelLogs/TripLogsList';
import TripsPage from './components/Trips/TripsPage';
import SubscriptionExpired from './components/SubscriptionExpired';

function AppContent() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<BusinessRegistration />} />
        <Route path="/subscription-expired" element={<SubscriptionExpired />} />
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardOverview />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/vehicles" element={
          <ProtectedRoute>
            <AppLayout>
              <VehicleList />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/drivers" element={
          <ProtectedRoute>
            <AppLayout>
              <DriverList />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/fuel-logs" element={
          <ProtectedRoute>
            <AppLayout>
              <FuelLogsList />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout>
              <AnalyticsDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute>
            <AppLayout>
              <BudgetManager />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/routes" element={
          <ProtectedRoute>
            <AppLayout>
              <RouteOptimization />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/trip-logs" element={
          <ProtectedRoute>
            <AppLayout>
              <TripLogsList />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/trips" element={
          <ProtectedRoute>
            <AppLayout>
              <TripsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <RouterProvider>
              <AppContent />
            </RouterProvider>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;