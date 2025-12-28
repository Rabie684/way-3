import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Footer: React.FC = () => {
  const { translate } = useAuth();
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-4 text-center text-sm mt-auto">
      &copy; {new Date().getFullYear()} {translate('appName')}. {translate('allRightsReserved')}
    </footer>
  );
};

export default Footer;