import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth/auth.store';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      // Even if there's an error, redirect to login
      // since we want to ensure the user is logged out
      navigate('/login');
    }
  };

  const handleNewRecipe = () => {
    navigate('/cost-analysis');
  };

  if (isAuthPage) return null;

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-white font-bold text-xl">
              Recipe Cost Analysis
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/recipes"
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Recipes
              </Link>
              <button
                onClick={handleNewRecipe}
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Recipe
              </button>
              <Link
                to="/settings"
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </Link>
            </nav>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-indigo-100">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}