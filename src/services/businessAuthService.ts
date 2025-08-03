import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { 
  Business, 
  BusinessUser, 
  BusinessRegistrationData, 
  BusinessLoginData, 
  BusinessValidationResult,
  Vehicle,
  Driver,
  FuelLog,
  Trip,
  Budget
} from '../types';
import { validateBusinessEmail, validateEmailDetailed, validatePassword } from '../utils/validation';

export class BusinessAuthService {
  // Business registration validation
  static validateBusinessRegistration(data: BusinessRegistrationData): BusinessValidationResult {
    const errors: string[] = [];

    if (!data.businessName.trim()) {
      errors.push('Business name is required');
    }

    // Enhanced email validation
    const emailValidation = validateBusinessEmail(data.businessEmail);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Enhanced contact person email validation
    const contactEmailValidation = validateEmailDetailed(data.contactPerson.email);
    if (!contactEmailValidation.isValid) {
      errors.push(`Contact person email: ${contactEmailValidation.errors.join(', ')}`);
    }

    if (!data.registrationNumber.trim()) {
      errors.push('Business registration number is required');
    }

    if (!data.taxId.trim()) {
      errors.push('Tax ID is required');
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!data.termsAccepted) {
      errors.push('You must accept the terms and conditions');
    }

    if (!data.privacyAccepted) {
      errors.push('You must accept the privacy policy');
    }

    // Additional business-specific validations
    if (data.businessName.length < 2) {
      errors.push('Business name must be at least 2 characters long');
    }

    if (data.contactPerson.name.trim().length < 2) {
      errors.push('Contact person name must be at least 2 characters long');
    }

    if (data.contactPerson.phone.trim().length < 10) {
      errors.push('Contact phone number must be at least 10 digits');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Real-time email validation for registration
  static validateEmailRealTime(email: string): { isValid: boolean; errors: string[] } {
    return validateBusinessEmail(email);
  }

  // Real-time password validation
  static validatePasswordRealTime(password: string): { isValid: boolean; errors: string[] } {
    return validatePassword(password);
  }

  // Business registration
  static async registerBusiness(data: BusinessRegistrationData): Promise<{ success: boolean; businessId?: string; error?: string }> {
    try {
      const validation = this.validateBusinessRegistration(data);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Check if email already exists
      try {
        const userCredential = await signInWithEmailAndPassword(auth, data.businessEmail, 'temp-password-for-check');
        // If we get here, the user exists
        return { success: false, error: 'An account with this email already exists' };
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // User doesn't exist, proceed with registration
        } else if (error.code === 'auth/wrong-password') {
          // User exists but wrong password, which means email is taken
          return { success: false, error: 'An account with this email already exists' };
        } else {
          // Other error, proceed with registration
        }
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.businessEmail, 
        data.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.businessName
      });

      // Send email verification
      await sendEmailVerification(user);

      const businessData: Omit<Business, 'id'> = {
        name: data.businessName,
        email: data.businessEmail,
        businessType: data.businessType,
        registrationNumber: data.registrationNumber,
        taxId: data.taxId,
        address: data.address,
        contactPerson: data.contactPerson,
        subscriptionPlan: 'basic',
        subscriptionStatus: 'trial',
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        maxVehicles: 5,
        maxDrivers: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        settings: {
          fuelEfficiencyTarget: 8.5,
          budgetAlertsEnabled: true,
          obdMonitoringEnabled: false,
          routeOptimizationEnabled: false,
          anomalyDetectionEnabled: true,
          emailNotifications: true,
          smsNotifications: false,
          timezone: 'Africa/Mbabane',
          currency: 'SZL',
          language: 'en'
        }
      };

      const businessRef = doc(db, 'businesses', user.uid);
      await setDoc(businessRef, businessData);

      const businessUserData: Omit<BusinessUser, 'id'> = {
        businessId: user.uid,
        email: data.businessEmail,
        role: 'owner',
        permissions: ['all'],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const businessUserRef = doc(db, 'businessUsers', user.uid);
      await setDoc(businessUserRef, businessUserData);

      return { success: true, businessId: user.uid };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) || 'Failed to register business' 
      };
    }
  }

  // Business login with enhanced validation
  static async loginBusiness(data: BusinessLoginData): Promise<{ success: boolean; businessId?: string; error?: string }> {
    try {
      // Validate email format before attempting login
      const emailValidation = validateEmailDetailed(data.email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.errors.join(', ') };
      }

      // Validate password is not empty
      if (!data.password.trim()) {
        return { success: false, error: 'Password is required' };
      }

      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
      }

      // Check if business exists
      const businessDoc = await getDoc(doc(db, 'businesses', user.uid));
      if (!businessDoc.exists()) {
        return { success: false, error: 'Business account not found' };
      }

      const businessData = businessDoc.data() as Business;
      
      // Check subscription status
      if (businessData.subscriptionStatus === 'expired' || businessData.subscriptionStatus === 'cancelled') {
        return { success: false, error: 'Your subscription has expired. Please renew to continue.' };
      }

      // Update last login
      await updateDoc(doc(db, 'businessUsers', user.uid), {
        lastLogin: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      return { success: true, businessId: user.uid };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) 
      };
    }
  }

  // Get business data
  static async getBusinessData(businessId: string): Promise<Business | null> {
    try {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      if (!businessDoc.exists()) {
        return null;
      }
      return { id: businessDoc.id, ...businessDoc.data() } as Business;
    } catch (error) {
      console.error('Error fetching business data:', error);
      return null;
    }
  }

  // Get business user data
  static async getBusinessUser(userId: string): Promise<BusinessUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'businessUsers', userId));
      if (!userDoc.exists()) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() } as BusinessUser;
    } catch (error) {
      console.error('Error fetching business user data:', error);
      return null;
    }
  }

  // Get business vehicles
  static async getBusinessVehicles(businessId: string): Promise<Vehicle[]> {
    try {
      const q = query(
        collection(db, 'vehicles'), 
        where('businessId', '==', businessId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Vehicle);
    } catch (error) {
      console.error('Error fetching business vehicles:', error);
      return [];
    }
  }

  // Get business drivers
  static async getBusinessDrivers(businessId: string): Promise<Driver[]> {
    try {
      const q = query(
        collection(db, 'drivers'), 
        where('businessId', '==', businessId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Driver);
    } catch (error) {
      console.error('Error fetching business drivers:', error);
      return [];
    }
  }

  // Password reset
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) 
      };
    }
  }

  // Resend email verification
  static async resendEmailVerification(user: User): Promise<{ success: boolean; error?: string }> {
    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        error: this.getAuthErrorMessage(error.code) 
      };
    }
  }

  // Helper method to get user-friendly error messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No business account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}