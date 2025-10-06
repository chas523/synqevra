import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { useCallback, useEffect, useState } from 'react';
import medplum_logo from '../../../assets/images/medplum_logo.png';
import { medplum } from '../../../lib/medplum';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    loading: true,
    error: null,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = medplum.getAccessToken();
      const isAuthenticated = await medplum.isAuthenticated();
      

      setAuthState({
        isAuthenticated,
        accessToken: token ?? null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication check failed',
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const loginResult = await medplum.startLogin({
        email,
        password,
        remember: false,
        scope: 'openid offline_access',
      });

      const code = loginResult?.code;
      if (!code) {
        throw new Error('Login did not return an authorization code');
      }

      await medplum.processCode(code);
      await checkAuthStatus();
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  // const logout = async () => {
  //   try {
  //     await medplum.signOut();
  //     setAuthState({
  //       isAuthenticated: false,
  //       accessToken: null,
  //       loading: false,
  //       error: null,
  //     });
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }
  // };

  return {
    ...authState,
    login,
    //logout,
    //checkAuthStatus,
  };
};

const LoginForm = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  // Make sure to import useLocation: import { useLocation } from '@modern-js/runtime/router';
  const location = useLocation();

  useEffect(() => {
    try {
      const _fullPath = `${location?.pathname ?? ''}${location?.search ?? ''}${location?.hash ?? ''}`;
      console.log('Current page URL (from useLocation):', location.pathname);
    } catch {
      console.log('Current page URL unavailable');
    }
  }, [location]);
  console.log(isAuthenticated)
  // Redirect to home page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Show loading state if checking authentication
  if (loading && !email && !password) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Logo i nagłówek */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 mb-4 flex items-center justify-center">
            <img
              src={medplum_logo}
              alt="Medplum Logo"
              className="h-16 w-16 rounded-2xl"
              onError={e => {
                // Fallback to purple gradient icon if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                (
                  e.target as HTMLImageElement
                ).nextElementSibling?.classList.remove('hidden');
              }}
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Sign in to Medplum
          </h2>
        </div>

        {/* Formularz */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Pole Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 text-sm bg-gray-50"
              disabled={loading}
            />
          </div>

          {/* Pole Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 text-sm bg-gray-50"
              disabled={loading}
            />
          </div>

          {/* Wyświetlenie błędów */}
          {(error || formError) && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {formError || error}
            </div>
          )}

          {/* Przycisk Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-labelledby="loading-title"
                    focusable="false"
                  >
                    <title>Signing in</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>

        {/* Dodatkowe opcje */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <a
              href="google.com"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
