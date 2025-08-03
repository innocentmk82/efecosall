import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessAuthService } from '../services/businessAuthService';
import { BusinessRegistrationData } from '../types';
import { useToast } from '../components/common/ToastContainer';
import LoadingButton from '../components/common/LoadingButton';
import { validateBusinessEmail, validateEmailDetailed, validatePassword } from '../utils/validation';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const BusinessRegistration: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    businessName: '',
    businessEmail: '',
    businessType: 'transportation',
    registrationNumber: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Eswatini'
    },
    contactPerson: {
      name: '',
      phone: '',
      email: ''
    },
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof BusinessRegistrationData] as Record<string, any>;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Real-time validation
    validateFieldRealTime(field, value);
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateFieldRealTime = (field: string, value: any) => {
    const newFieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'businessEmail':
        const businessEmailValidation = validateBusinessEmail(value);
        if (!businessEmailValidation.isValid) {
          newFieldErrors[field] = businessEmailValidation.errors[0];
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'contactPerson.email':
        const contactEmailValidation = validateEmailDetailed(value);
        if (!contactEmailValidation.isValid) {
          newFieldErrors[field] = contactEmailValidation.errors[0];
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          newFieldErrors[field] = passwordValidation.errors[0];
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          newFieldErrors[field] = 'Passwords do not match';
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'businessName':
        if (value.trim().length < 2) {
          newFieldErrors[field] = 'Business name must be at least 2 characters long';
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'contactPerson.name':
        if (value.trim().length < 2) {
          newFieldErrors[field] = 'Contact person name must be at least 2 characters long';
        } else {
          delete newFieldErrors[field];
        }
        break;
      case 'contactPerson.phone':
        if (value.trim().length < 10) {
          newFieldErrors[field] = 'Contact phone number must be at least 10 digits';
        } else {
          delete newFieldErrors[field];
        }
        break;
    }
    
    setFieldErrors(newFieldErrors);
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) errors.push('Business name is required');
        if (!formData.businessEmail.trim()) errors.push('Business email is required');
        if (!formData.businessType) errors.push('Business type is required');
        break;
      case 2:
        if (!formData.registrationNumber.trim()) errors.push('Registration number is required');
        if (!formData.taxId.trim()) errors.push('Tax ID is required');
        if (!formData.address.street.trim()) errors.push('Street address is required');
        if (!formData.address.city.trim()) errors.push('City is required');
        break;
      case 3:
        if (!formData.contactPerson.name.trim()) errors.push('Contact person name is required');
        if (!formData.contactPerson.phone.trim()) errors.push('Contact phone is required');
        if (!formData.contactPerson.email.trim()) errors.push('Contact email is required');
        break;
      case 4:
        if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
        if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
        if (!formData.termsAccepted) errors.push('You must accept the terms and conditions');
        if (!formData.privacyAccepted) errors.push('You must accept the privacy policy');
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await BusinessAuthService.registerBusiness(formData);
      
      if (result.success) {
        setSuccess(true);
        addToast({
          type: 'success',
          title: 'Registration Successful!',
          message: 'Please check your email to verify your account.'
        });
      } else {
        setError(result.error || 'Registration failed');
        addToast({
          type: 'error',
          title: 'Registration Failed',
          message: result.error || 'Please check your information and try again.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'An unexpected error occurred during registration.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string): string | null => {
    return fieldErrors[field] || null;
  };

  const getInputClassName = (field: string): string => {
    const baseClasses = "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";
    const normalClasses = "border-gray-300";
    
    return `${baseClasses} ${getFieldError(field) ? errorClasses : normalClasses}`;
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your business account has been created successfully. Please check your email to verify your account before logging in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Business Info', description: 'Basic business details' },
    { number: 2, title: 'Legal Details', description: 'Registration & address' },
    { number: 3, title: 'Contact Info', description: 'Contact person details' },
    { number: 4, title: 'Security', description: 'Password & agreements' }
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Business Name *</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.businessName}
            onChange={e => handleInputChange('businessName', e.target.value)}
            className={getInputClassName('businessName')}
            placeholder="Enter your business name"
            required
          />
        </div>
        {getFieldError('businessName') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('businessName')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Business Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={formData.businessEmail}
            onChange={e => handleInputChange('businessEmail', e.target.value)}
            className={getInputClassName('businessEmail')}
            placeholder="business@example.com"
            required
          />
        </div>
        {getFieldError('businessEmail') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('businessEmail')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Business Type *</label>
        <select
          value={formData.businessType}
          onChange={e => handleInputChange('businessType', e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        >
          <option value="transportation">Transportation</option>
          <option value="delivery">Delivery</option>
          <option value="logistics">Logistics</option>
          <option value="construction">Construction</option>
          <option value="agriculture">Agriculture</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Registration Number *</label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={e => handleInputChange('registrationNumber', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Business registration number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Tax ID *</label>
        <input
          type="text"
          value={formData.taxId}
          onChange={e => handleInputChange('taxId', e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Tax identification number"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Street Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.address.street}
            onChange={e => handleInputChange('address.street', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Street address"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">City *</label>
          <input
            type="text"
            value={formData.address.city}
            onChange={e => handleInputChange('address.city', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="City"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">State/Region</label>
          <input
            type="text"
            value={formData.address.state}
            onChange={e => handleInputChange('address.state', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="State or region"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">ZIP Code</label>
          <input
            type="text"
            value={formData.address.zipCode}
            onChange={e => handleInputChange('address.zipCode', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="ZIP code"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Country</label>
          <select
            value={formData.address.country}
            onChange={e => handleInputChange('address.country', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="Eswatini">Eswatini</option>
            <option value="South Africa">South Africa</option>
            <option value="Mozambique">Mozambique</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Contact Person Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.contactPerson.name}
            onChange={e => handleInputChange('contactPerson.name', e.target.value)}
            className={getInputClassName('contactPerson.name')}
            placeholder="Full name"
            required
          />
        </div>
        {getFieldError('contactPerson.name') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('contactPerson.name')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Contact Phone *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            value={formData.contactPerson.phone}
            onChange={e => handleInputChange('contactPerson.phone', e.target.value)}
            className={getInputClassName('contactPerson.phone')}
            placeholder="+268 1234 5678"
            required
          />
        </div>
        {getFieldError('contactPerson.phone') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('contactPerson.phone')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Contact Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={formData.contactPerson.email}
            onChange={e => handleInputChange('contactPerson.email', e.target.value)}
            className={getInputClassName('contactPerson.email')}
            placeholder="contact@business.com"
            required
          />
        </div>
        {getFieldError('contactPerson.email') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('contactPerson.email')}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2 font-medium">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            className={getInputClassName('password')}
            placeholder="Create a strong password"
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
        {getFieldError('password') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('password')}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long with uppercase, lowercase, and number</p>
      </div>

      <div>
        <label className="block text-gray-700 mb-2 font-medium">Confirm Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            className={getInputClassName('confirmPassword')}
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {getFieldError('confirmPassword') && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError('confirmPassword')}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={formData.termsAccepted}
            onChange={e => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
            I accept the{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> *
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.privacyAccepted}
            onChange={e => handleInputChange('privacyAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="privacy" className="ml-3 block text-sm text-gray-700">
            I accept the{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Business Account</h2>
          <p className="text-gray-600 mt-2">Join E-FECOS to optimize your fleet's fuel efficiency</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.number}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Please fix the following errors:</span>
            </div>
            <ul className="text-sm list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Creating Account..."
                className="px-6 py-3"
              >
                Create Account
              </LoadingButton>
            )}
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistration;