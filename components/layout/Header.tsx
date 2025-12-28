import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { UserRole } from '../../types';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout, translate, language, setLanguage, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light rounded-md md:hidden"
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <Link to="/" className="text-2xl font-bold text-primary-DEFAULT px-2">
          {translate('appName')}
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-4 mx-auto">
        {user && (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-primary-DEFAULT dark:text-gray-300 dark:hover:text-primary-light transition-colors">
              {translate('dashboard')}
            </Link>
            <Link to="/channels" className="text-gray-600 hover:text-primary-DEFAULT dark:text-gray-300 dark:hover:text-primary-light transition-colors">
              {translate('channels')}
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-primary-DEFAULT dark:text-gray-300 dark:hover:text-primary-light transition-colors">
              {translate('profile')}
            </Link>
            {user.role === UserRole.PROFESSOR && (
              <Link to="/professor/channels/create" className="text-gray-600 hover:text-primary-DEFAULT dark:text-gray-300 dark:hover:text-primary-light transition-colors">
                {translate('createChannel')}
              </Link>
            )}
          </>
        )}
      </nav>

      <div className="flex items-center space-x-2 md:space-x-4" style={{ direction: currentDirection }}>
        {user ? (
          <>
            <span className="hidden md:block text-gray-700 dark:text-gray-200">
              {user.name} ({translate(user.role)})
            </span>
            <Button onClick={handleLogout} variant="danger" size="sm">
              {translate('logout')}
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="primary" size="sm" className="hidden sm:inline-block">
                {translate('login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm" className="hidden sm:inline-block">
                {translate('register')}
              </Button>
            </Link>
          </>
        )}

        <button
          onClick={toggleDarkMode}
          className="text-gray-600 dark:text-gray-300 hover:text-primary-DEFAULT dark:hover:text-primary-light focus:outline-none p-1 rounded-md"
          aria-label={isDarkMode ? translate('lightMode') : translate('darkMode')}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 7.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H8.25a.75.75 0 01-.75-.75zM12 18a6 6 0 100-12 6 6 0 000 12zM19.5 7.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H20.25a.75.75 0 01-.75-.75zM18 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18.75a.75.75 0 01-.75-.75zM12 19.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V20.25a.75.75 0 01.75-.75zM7.5 19.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H8.25a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 4.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.375 3.375A.75.75 0 008.5 4.5v1.728a9.006 9.006 0 00-3.13 3.13H3.375a.75.75 0 000 1.5h1.728A9.006 9.006 0 006.772 15.5h-1.728a.75.75 0 000 1.5H6.772a9.006 9.006 0 003.13 3.13v1.728a.75.75 0 001.5 0v-1.728a9.006 9.006 0 003.13-3.13h1.728a.75.75 0 000-1.5h-1.728a9.006 9.006 0 00-3.13-3.13V8.5a.75.75 0 00-1.5 0v1.728a9.006 9.006 0 00-3.13-3.13H4.5a.75.75 0 00-.75.75zm1.5 2.875a7.502 7.502 0 00-1.258 11.084C8.441 19.344 11.233 19.75 12 19.75c.768 0 3.56-.406 4.383-1.416a7.502 7.502 0 00-1.258-11.084A7.502 7.502 0 0012 5.5a7.502 7.502 0 00-1.125.75zM12 9a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V9.75a.75.75 0 01.75-.75z" />
            </svg>
          )}
        </button>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ar' | 'fr')}
            className="block appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-DEFAULT"
          >
            <option value="ar">{translate('arabic')}</option>
            <option value="fr">{translate('french')}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
