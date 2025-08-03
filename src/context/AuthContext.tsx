import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { BusinessAuthService } from '../services/businessAuthService';
import { Business, BusinessUser } from '../types';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  businessUser: BusinessUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshBusinessData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessUser, setBusinessUser] = useState<BusinessUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBusinessData = useCallback(async () => {
    if (user) {
      try {
        const businessData = await BusinessAuthService.getBusinessData(user.uid);
        setBusiness(businessData);
      } catch (error) {
        console.error('Error refreshing business data:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get business data
          const businessData = await BusinessAuthService.getBusinessData(firebaseUser.uid);
          if (isMounted) {
            setBusiness(businessData);
          }
          
          // Get business user data
          const businessUserData = await BusinessAuthService.getBusinessUser(firebaseUser.uid);
          if (isMounted) {
            setBusinessUser(businessUserData);
          }
        } catch (error) {
          console.error('Error loading business data:', error);
          if (isMounted) {
            setBusiness(null);
            setBusinessUser(null);
          }
        }
      } else {
        if (isMounted) {
          setBusiness(null);
          setBusinessUser(null);
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setBusiness(null);
    setBusinessUser(null);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    business,
    businessUser,
    loading,
    logout,
    refreshBusinessData
  }), [user, business, businessUser, loading, logout, refreshBusinessData]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 