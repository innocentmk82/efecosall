import { auth } from './firebase';
import { SharedAuthService } from '../../shared/services/authService';
import { dataService } from './dataService';
import { User } from '@/types';
import { USER_TYPES } from '../../shared/config/firebase';
import { db } from './firebase';

export class AuthService extends SharedAuthService {
  constructor() {
    super(auth, db);
  }

  // Override signIn to return mobile-compatible User type
  async signIn(email: string, password: string): Promise<User> {
    const result = await super.signIn(email, password);
    if (!result.success || !result.user) {
      throw new Error(result.error || 'Authentication failed');
    }
    return result.user as User;
  }

  // Override signUp to return mobile-compatible User type
  async signUp(name: string, email: string, password: string): Promise<User> {
    const result = await super.signUp(name, email, password, USER_TYPES.CITIZEN);
    if (!result.success || !result.user) {
      throw new Error(result.error || 'Registration failed');
    }
    return result.user as User;
  }
}

export const authService = new AuthService();