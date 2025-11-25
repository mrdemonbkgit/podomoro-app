import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export function LoginPage() {
  const { user, loading, error, signInWithGoogle, devSignIn } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isDev = import.meta.env.DEV;

  // Redirect to kamehameha if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/kamehameha');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Navigation will happen automatically via the useEffect above
    } catch (err) {
      console.error('Sign in failed:', err);
      setIsSigningIn(false);
    }
  };

  const handleDevSignIn = async () => {
    if (!devSignIn) return;
    setIsSigningIn(true);
    try {
      await devSignIn();
      navigate('/kamehameha');
    } catch (err) {
      console.error('Dev sign in failed:', err);
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-4xl font-bold text-white mb-2">ZenFocus</h1>
            <p className="text-purple-200 text-lg">Kamehameha Recovery Tool</p>
          </div>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-white/80 text-sm leading-relaxed">
              Track your progress, build streaks, and get AI-powered support on
              your recovery journey.
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* DEV MODE: Test Login Button */}
          {isDev && devSignIn && (
            <button
              onClick={handleDevSignIn}
              disabled={isSigningIn}
              data-testid="dev-login-button"
              className="mt-4 w-full bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-500/50 text-yellow-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">🧪</span>
              <span>Dev Login (Testing Only)</span>
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">
                {error.message}
              </p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              Your data is private and secure.
              <br />
              We only store what's necessary for your recovery journey.
            </p>
          </div>
        </div>

        {/* Continue as Guest */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/timer')}
            className="text-purple-200 hover:text-white text-sm underline underline-offset-4 transition-colors"
          >
            Continue to Timer (no login required)
          </button>
        </div>
      </div>
    </div>
  );
}
