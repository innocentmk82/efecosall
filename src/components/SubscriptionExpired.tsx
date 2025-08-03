import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionExpired: React.FC = () => {
  const navigate = useNavigate();
  const { business, logout } = useAuth();

  const handleUpgrade = () => {
    // In a real app, this would redirect to a payment processor
    window.open('https://stripe.com', '_blank');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Expired</h1>
        <p className="text-gray-600 mb-6">
          Your {business?.subscriptionPlan || 'subscription'} plan has expired. 
          Please upgrade to continue using E-FECOS.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Upgrade Subscription
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@efecos.com" className="text-blue-600 hover:underline">
              support@efecos.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpired;