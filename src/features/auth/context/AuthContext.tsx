import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithRedirect, 
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase/config';
import { AuthContextType, toUser } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ReturnType<typeof toUser>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    // Check for dev mode mock auth first
    const isDev = import.meta.env.DEV;
    const mockAuthUser = localStorage.getItem('mockAuthUser');
    
    if (isDev && mockAuthUser) {
      try {
        const mockUser = JSON.parse(mockAuthUser);
        setUser(mockUser);
        setLoading(false);
        console.log('🧪 DEV MODE: Using mock auth user:', mockUser.email);
        return;
      } catch (e) {
        console.error('Failed to parse mock auth user:', e);
        localStorage.removeItem('mockAuthUser');
      }
    }

    // Check for redirect result first (after redirect from Google sign-in)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Successfully signed in via redirect:', result.user.email);
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
        setError(error as Error);
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        setUser(toUser(firebaseUser));
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // Use redirect instead of popup - more reliable and works in all contexts
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const error = err as Error;
      console.error('Sign in error:', error);
      setError(error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      // Clear mock auth if in dev mode
      if (import.meta.env.DEV && localStorage.getItem('mockAuthUser')) {
        localStorage.removeItem('mockAuthUser');
        setUser(null);
        console.log('🧪 DEV MODE: Cleared mock auth user');
        return;
      }
      
      await firebaseSignOut(auth);
    } catch (err) {
      const error = err as Error;
      console.error('Sign out error:', error);
      setError(error);
      throw error;
    }
  };

  // DEV MODE ONLY: Mock sign-in for testing
  const devSignIn = async () => {
    if (!import.meta.env.DEV) {
      throw new Error('Dev sign-in only available in development mode');
    }
    
    const mockUser = {
      uid: 'dev-test-user-12345',
      email: 'test@zenfocus.dev',
      displayName: 'Test User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      emailVerified: true
    };
    
    localStorage.setItem('mockAuthUser', JSON.stringify(mockUser));
    setUser(mockUser);
    console.log('🧪 DEV MODE: Mock user signed in:', mockUser.email);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    devSignIn: import.meta.env.DEV ? devSignIn : undefined,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

