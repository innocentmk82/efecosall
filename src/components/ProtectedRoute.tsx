import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBusiness?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireBusiness = true 
}) => {
  const { user, business, loading } = useAuth();
  const location = useLocation();

  // Prevent rendering if we're in a loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we're already on a redirect route to prevent loops
  const isOnRedirectRoute = location.pathname === '/login' || 
                           location.pathname === '/register' || 
                           location.pathname === '/subscription-expired';

  // If no user, redirect to login (but not if already on login page)
  if (!user && !isOnRedirectRoute) {
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }

  // If business is required but not available, redirect to login
  // Only redirect if we have a user but no business data after loading is complete
  if (requireBusiness && user && !business && !loading && !isOnRedirectRoute) {
    // This could happen if the user's business data was deleted or corrupted
    // Redirect them to login to re-authenticate
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }

  // If business subscription is expired, redirect to subscription page (but not if already there)
  if (business && business.subscriptionStatus === 'expired' && location.pathname !== '/subscription-expired') {
    return <Navigate to="/subscription-expired" replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 