import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification,
  Auth
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { USER_TYPES, COLLECTIONS, UserType } from '../config/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  companyId?: string;
  companyName?: string;
  monthlyFuelLimit?: number;
  personalBudget?: number;
  businessId?: string;
  permissions?: string[];
  role?: string;
  isActive?: boolean;
  createdAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class SharedAuthService {
  private auth: Auth;
  private db: any;

  constructor(auth: Auth, db: any) {
    this.auth = auth;
    this.db = db;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile from database
      const userProfile = await this.getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        return { success: false, error: 'User profile not found. Please contact support.' };
      }
      
      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Create new account (citizens only for mobile, business users for web)
  async signUp(name: string, email: string, password: string, userType: UserType = USER_TYPES.CITIZEN): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase profile
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user profile in database
      const userProfile = await this.createUserProfile(firebaseUser.uid, {
        name,
        email,
        type: userType,
        personalBudget: userType === USER_TYPES.CITIZEN ? 0 : undefined,
      });
      
      return { success: true, user: userProfile };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  // Get user profile with role detection
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // First check if user is a business user (driver)
      const businessUserRef = doc(this.db, COLLECTIONS.BUSINESS_USERS, userId);
      const businessUserSnap = await getDoc(businessUserRef);
      
      if (businessUserSnap.exists()) {
        const businessData = businessUserSnap.data();
        
        // Get business details
        let businessName = '';
        if (businessData.businessId) {
          const businessRef = doc(this.db, COLLECTIONS.BUSINESSES, businessData.businessId);
          const businessSnap = await getDoc(businessRef);
          if (businessSnap.exists()) {
            businessName = businessSnap.data().name || '';
          }
        }
        
        return {
          id: userId,
          name: businessData.email?.split('@')[0] || 'Driver',
          email: businessData.email || '',
          type: USER_TYPES.DRIVER,
          companyId: businessData.businessId,
          companyName: businessName,
          monthlyFuelLimit: businessData.monthlyFuelLimit || 0,
          businessId: businessData.businessId,
          permissions: businessData.permissions || [],
          role: businessData.role || 'driver',
          isActive: businessData.isActive !== false,
          createdAt: businessData.createdAt?.toDate() || new Date(),
        };
      }
      
      // Check drivers collection for temporal password users
      const driversRef = collection(this.db, COLLECTIONS.DRIVERS);
      const driverQuery = query(driversRef, where('authUid', '==', userId));
      const driverSnapshot = await getDocs(driverQuery);
      
      if (!driverSnapshot.empty) {
        const driverData = driverSnapshot.docs[0].data();
        
        // Get business details if businessId exists
        let businessName = '';
        if (driverData.businessId) {
          const businessRef = doc(this.db, COLLECTIONS.BUSINESSES, driverData.businessId);
          const businessSnap = await getDoc(businessRef);
          if (businessSnap.exists()) {
            businessName = businessSnap.data().name || '';
          }
        }
        
        return {
          id: userId,
          name: driverData.name || 'Driver',
          email: driverData.email || '',
          type: USER_TYPES.DRIVER,
          companyId: driverData.businessId,
          companyName: businessName,
          monthlyFuelLimit: driverData.monthlyFuelLimit || 0,
          businessId: driverData.businessId,
          createdAt: driverData.createdAt?.toDate() || new Date(),
        };
      }
      
      // Check regular users collection
      const userRef = doc(this.db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        return {
          id: userId,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          type: userData.type || USER_TYPES.CITIZEN,
          personalBudget: userData.personalBudget || 0,
          createdAt: userData.createdAt?.toDate() || new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Create user profile
  async createUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const userProfile: User = {
        id: userId,
        name: userData.name || '',
        email: userData.email || '',
        type: userData.type || USER_TYPES.CITIZEN,
        personalBudget: userData.personalBudget || 0,
        createdAt: new Date(),
        ...userData
      };

      const userRef = doc(this.db, COLLECTIONS.USERS, userId);
      await setDoc(userRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
      });

      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(this.handleAuthError(error));
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.handleAuthError(error));
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Handle Firebase auth errors
  private handleAuthError(error: any): string {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection and try again.';
        break;
      case 'auth/operation-not-allowed':
        message = 'This operation is not allowed. Please contact support.';
        break;
      default:
        message = error.message || 'Authentication failed. Please try again.';
    }
    
    return message;
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long.' };
    }
    
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters.' };
    }
    
    return { isValid: true };
  }
}