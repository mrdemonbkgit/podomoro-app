import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
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
      // Use popup - more reliable than redirect for Vercel deployments
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Successfully signed in:', result.user.email);
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
      await firebaseSignOut(auth);
    } catch (err) {
      const error = err as Error;
      console.error('Sign out error:', error);
      setError(error);
      throw error;
    }
  };

  // DEV MODE ONLY: Sign in to emulator for testing
  const devSignIn = async () => {
    if (!import.meta.env.DEV) {
      throw new Error('Dev sign-in only available in development mode');
    }

    try {
      // Import signInAnonymously dynamically to use it here
      const { signInAnonymously } = await import('firebase/auth');

      // Sign in anonymously to the Firebase Auth Emulator
      // This creates a real auth token that Cloud Functions can verify
      const userCredential = await signInAnonymously(auth);

      console.log(
        '🧪 DEV MODE: Signed in to emulator as anonymous user:',
        userCredential.user.uid
      );

      // The onAuthStateChanged listener will automatically update the user state
    } catch (err) {
      const error = err as Error;
      console.error('Dev sign-in error:', error);
      setError(error);
      throw error;
    }
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
