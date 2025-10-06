import { medplum } from '@/lib/medplum';
import './index.css';
import type React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@modern-js/runtime/router';

const Index: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await medplum.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    if (isAuthenticated) {
      try {
        await medplum.signOut();
        setIsAuthenticated(false);
        navigate("/auth/login");
      } catch (e) {
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
      <div className='flex gap-2'>
        {!isAuthenticated ? (<Link
          to="/auth/login"
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Przejdź do logowania"
        >
          Przejdź do logowania
        </Link>)
        :
        (<button onClick={() => logout()}type='button' className="px-4 py-2 rounded-md bg-transparent border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Wyloguj
        </button>)
        }
        <Link
          to="/observations"
          className="px-4 py-2 rounded-md bg-transparent border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Zobacz obserwacje"
        >
          Zobacz obserwacje
        </Link>


        

      </div>
  );
};

export default Index;
