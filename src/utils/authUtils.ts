import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export const clearAuthState = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Clear all Firebase-related storage items
    const keysToRemove = [];
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('auth') || key.includes('user'))) {
        keysToRemove.push(key);
      }
    }
    
    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('auth') || key.includes('user'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear any remaining Firebase auth state
    localStorage.removeItem('firebase:authUser:');
    sessionStorage.removeItem('firebase:authUser:');
    
    // Force a page reload to clear any remaining state
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    console.log('Auth state cleared successfully');
  } catch (error) {
    console.error('Error clearing auth state:', error);
    throw error;
  }
};

export const isAuthStateCached = (): boolean => {
  // Check if there are any Firebase-related items in storage
  const hasFirebaseItems = Array.from({ length: localStorage.length }, (_, i) => {
    const key = localStorage.key(i);
    return key && key.includes('firebase');
  }).some(Boolean);
  
  return hasFirebaseItems;
};

export const clearAllBrowserCache = async (): Promise<void> => {
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Force reload
    window.location.reload();
  } catch (error) {
    console.error('Error clearing browser cache:', error);
    throw error;
  }
}; 