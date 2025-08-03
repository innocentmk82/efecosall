import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useUser } from '@/contexts/UserContext';
import { dataService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { Eye, EyeOff, Mail, Lock, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function LoginScreen({ onSignUp }: { onSignUp?: () => void }) {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginMode, setLoginMode] = useState<'regular' | 'driver'>('regular');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      console.log('Attempting login for:', email, 'Mode:', loginMode);
      
      let userProfile;
      
      if (loginMode === 'driver') {
        // Try driver login with temporal password
        try {
          userProfile = await authService.signInDriver(email.trim(), password);
        } catch (driverError: any) {
          console.log('Driver login failed, trying regular login:', driverError.message);
          // Fall back to regular login
          userProfile = await authService.signIn({ email: email.trim(), password });
        }
      } else {
        // Regular Firebase authentication
        userProfile = await authService.signIn({ email: email.trim(), password });
      }
      
      console.log('Login successful, user type:', userProfile.type);
      setUser(userProfile);
      
      // Sync data with web app
      await dataService.syncUserData(userProfile.id);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage = err.message || 'Login failed. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue tracking your fuel usage</Text>
          
          {/* Login Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, loginMode === 'regular' && styles.modeButtonActive]}
              onPress={() => setLoginMode('regular')}
            >
              <Text style={[styles.modeButtonText, loginMode === 'regular' && styles.modeButtonTextActive]}>
                Regular Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, loginMode === 'driver' && styles.modeButtonActive]}
              onPress={() => setLoginMode('driver')}
            >
              <Text style={[styles.modeButtonText, loginMode === 'driver' && styles.modeButtonTextActive]}>
                Driver Login
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                  setResetEmailSent(false);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder={loginMode === 'driver' ? 'Temporal Password' : 'Password'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Mode Info */}
          {loginMode === 'driver' && (
            <View style={styles.driverInfo}>
              <Text style={styles.driverInfoText}>
                Use the temporal password provided by your company administrator
              </Text>
            </View>
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Reset Email Sent Message */}
          {resetEmailSent && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Password reset email sent!</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          {loginMode === 'regular' && (
            <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <TouchableOpacity 
            style={styles.signUpContainer} 
            onPress={onSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          {/* Demo Accounts */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => {
                setEmail('citizen@demo.com');
                setPassword('demo123');
                setLoginMode('regular');
              }}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>Citizen Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => {
                setEmail('driver@demo.com');
                setPassword('TEMP1234');
                setLoginMode('driver');
              }}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>Driver Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    width: '100%',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  driverInfo: {
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  driverInfoText: {
    color: '#1E40AF',
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    marginTop: 24,
    paddingVertical: 8,
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
  },
  signUpHighlight: {
    color: '#2563EB',
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 32,
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoButtonText: {
    color: '#4B5563',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});