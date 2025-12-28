import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, translate, language } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: translate('dashboard'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7-7-7M15 10v10a1 1 0 01-1 1h-3"></path></svg>
    )},
    { path: '/channels', label: translate('channels'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V4m0 0a2 2 0 012-2h2a2 2 0 012 2v2m-6 5a2 2 0 002 2h2a2 2 0 002-2"></path></svg>
    )},
    { path: '/profile', label: translate('profile'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
    )},
  ];

  if (user?.role === UserRole.PROFESSOR) {
    navItems.push({ path: '/professor/channels/create', label: translate('createChannel'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    )});
  }

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose}></div>
      )}

      <aside
        className={`fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} transform ${isOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:relative md:translate-x-0 z-50 md:z-auto w-64 bg-white dark:bg-gray-800 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out flex-shrink-0`}
        style={{ direction: currentDirection }}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary-DEFAULT">{translate('appName')}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 md:hidden focus:outline-none focus:ring-2 focus:ring-primary-light rounded-md"
            aria-label="Close navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="mt-5">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center p-4 text-gray-700 dark:text-gray-200 hover:bg-primary-light dark:hover:bg-primary-dark transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-DEFAULT text-white dark:bg-primary-dark'
                      : ''
                  }`}
                >
                  <span className={`${language === 'ar' ? 'ml-3' : 'mr-3'}`}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
