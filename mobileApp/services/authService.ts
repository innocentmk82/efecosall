import { auth, db } from './firebase';
import { SharedAuthService } from '../shared/services/authService';
import { User, AuthResult, LoginCredentials, SignUpData } from '../shared/types';
import { USER_TYPES } from '../shared/config/firebase';

export class MobileAuthService extends SharedAuthService {
  constructor() {
    super(auth, db);
  }

  // Override signIn to return mobile-compatible User type
  async signIn(credentials: LoginCredentials): Promise<User> {
    const result = await super.signIn(credentials);
    if (!result.success || !result.user) {
      throw new Error(result.error || 'Authentication failed');
    }
    return result.user;
  }

  // Override signUp to return mobile-compatible User type
  async signUp(signUpData: SignUpData): Promise<User> {
    const result = await super.signUp({
      ...signUpData,
      userType: signUpData.userType || USER_TYPES.CITIZEN
    });
    if (!result.success || !result.user) {
      throw new Error(result.error || 'Registration failed');
    }
    return result.user;
  }

  // Special method for driver login with temporal password
  async signInDriver(email: string, temporalPassword: string): Promise<User> {
    try {
      // First, try to find the driver by email and temporal password
      const driversRef = collection(this.db, 'drivers');
      const driverQuery = query(
        driversRef, 
        where('email', '==', email),
        where('temporalPassword', '==', temporalPassword)
      );
      const driverSnapshot = await getDocs(driverQuery);
      
      if (driverSnapshot.empty) {
        throw new Error('Invalid credentials. Please check your email and temporal password.');
      }
      
      const driverData = driverSnapshot.docs[0].data();
      
      // If driver has authUid, use regular Firebase auth
      if (driverData.authUid) {
        // This driver already has a Firebase account
        throw new Error('Please use your regular password to sign in.');
      }
      
      // Create Firebase account for the driver
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        temporalPassword + '_temp_' + Date.now() // Make it unique
      );
      
      const firebaseUser = userCredential.user;
      
      // Update driver record with authUid
      const driverRef = driverSnapshot.docs[0].ref;
      await updateDoc(driverRef, {
        authUid: firebaseUser.uid,
        updatedAt: serverTimestamp()
      });
      
      // Create user profile
      const userProfile = await this.createUserProfile(firebaseUser.uid, {
        name: driverData.name,
        email: driverData.email,
        type: USER_TYPES.DRIVER,
        companyId: driverData.businessId,
        monthlyFuelLimit: driverData.monthlyFuelLimit || 0,
        licenseNumber: driverData.licenseNumber,
        department: driverData.department,
        assignedVehicles: driverData.assignedVehicles || [],
        businessId: driverData.businessId,
        permissions: [],
        role: 'driver',
        isActive: true,
      });
      
      return userProfile;
    } catch (error: any) {
      console.error('Driver sign in error:', error);
      throw new Error(error.message || 'Driver authentication failed');
    }
  }
}

export const authService = new MobileAuthService();