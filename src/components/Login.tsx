import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BusinessAuthService } from '../services/businessAuthService';
import { BusinessLoginData } from '../types';
import { useToast } from '../components/common/ToastContainer';
import LoadingButton from '../components/common/LoadingButton';
import { validateEmailDetailed } from '../utils/validation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';


const Login: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<BusinessLoginData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleInputChange = (field: keyof BusinessLoginData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    if (field === 'email') {
      const emailValidation = validateEmailDetailed(value);
      setEmailError(emailValidation.isValid ? null : emailValidation.errors[0]);
    } else if (field === 'password') {
      setPasswordError(value.trim() ? null : 'Password is required');
    }
    
    // Clear general errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    const emailValidation = validateEmailDetailed(formData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.errors[0]);
      isValid = false;
    } else {
      setEmailError(null);
    }
    
    // Validate password
    if (!formData.password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await BusinessAuthService.loginBusiness(formData);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'You have successfully logged in to E-FECOS.'
        });
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
        addToast({
          type: 'error',
          title: 'Login Failed',
          message: result.error || 'Please check your credentials and try again.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      addToast({
        type: 'error',
        title: 'Login Error',
        message: err.message || 'An unexpected error occurred during login.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    const emailValidation = validateEmailDetailed(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await BusinessAuthService.resetPassword(formData.email);
      if (result.success) {
        setSuccess('Password reset email sent. Please check your inbox.');
        addToast({
          type: 'success',
          title: 'Reset Email Sent',
          message: 'Please check your inbox for password reset instructions.'
        });
      } else {
        setError(result.error || 'Failed to send reset email');
        addToast({
          type: 'error',
          title: 'Reset Failed',
          message: result.error || 'Failed to send password reset email.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      addToast({
        type: 'error',
        title: 'Reset Error',
        message: err.message || 'An error occurred while sending reset email.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your E-FECOS account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your business email"
                required
              />
            </div>
            {emailError && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Signing in..."
            className="w-full"
            size="lg"
            disabled={!!emailError || !!passwordError}
          >
            Sign In
          </LoadingButton>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have a business account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline font-medium transition-colors"
            >
              Register here
            </button>
          </p>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;