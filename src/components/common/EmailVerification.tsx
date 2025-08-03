import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BusinessAuthService } from '../../services/businessAuthService';
import { useToast } from './ToastContainer';
import LoadingButton from './LoadingButton';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationProps {
  onVerified?: () => void;
  onCancel?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified, onCancel }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);

  const checkEmailVerification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Reload user to get latest verification status
      await user.reload();
      
      if (user.emailVerified) {
        setVerificationChecked(true);
        addToast({
          type: 'success',
          title: 'Email Verified!',
          message: 'Your email has been successfully verified.'
        });
        onVerified?.();
      } else {
        addToast({
          type: 'info',
          title: 'Not Verified Yet',
          message: 'Please check your email and click the verification link.'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Verification Check Failed',
        message: 'Unable to check verification status. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) return;
    
    setResendLoading(true);
    try {
      const result = await BusinessAuthService.resendEmailVerification(user);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Verification Email Sent',
          message: 'Please check your inbox for the verification link.'
        });
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Send Email',
          message: result.error || 'Unable to send verification email.'
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'An error occurred while sending verification email.'
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification link to <strong>{user?.email}</strong>
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Check your email</p>
              <p>Click the verification link in the email we sent to complete your registration.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Can't find the email?</p>
              <p>Check your spam folder or request a new verification email below.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <LoadingButton
          onClick={checkEmailVerification}
          loading={loading}
          loadingText="Checking..."
          className="w-full"
          size="lg"
        >
          I've Verified My Email
        </LoadingButton>

        <button
          onClick={resendVerificationEmail}
          disabled={resendLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resendLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Resend Verification Email
            </>
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Having trouble? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification; 