import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TEXT_TRANSLATIONS } from './constants';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ChannelList from './pages/ChannelList';
import ChannelDetails from './pages/ChannelDetails';
import ProfessorChannels from './pages/professor/ProfessorChannels';
import CreateChannel from './pages/professor/CreateChannel';
import Profile from './pages/Profile';
import ChatPage from './pages/ChatPage';
import JarvisChatbot from './components/JarvisChatbot';
import { updateChannelStarsMonthly } from './services/channelService';
import ProfessorProfile from './pages/ProfessorProfile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl dark:text-gray-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-DEFAULT"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { user, language } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate monthly star updates
  useEffect(() => {
    // Run once on app load
    updateChannelStarsMonthly();

    // Set up interval for future monthly updates (mocking)
    const interval = setInterval(() => {
      updateChannelStarsMonthly();
    }, 30 * 24 * 60 * 60 * 1000); // Roughly once a month

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        <main className="flex-1 p-4 overflow-y-auto w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/channels"
              element={
                <PrivateRoute>
                  <ChannelList />
                </PrivateRoute>
              }
            />
            <Route
              path="/channel/:id"
              element={
                <PrivateRoute>
                  <ChannelDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:receiverId"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/professor/:professorId"
              element={
                <PrivateRoute>
                  <ProfessorProfile />
                </PrivateRoute>
              }
            />

            {/* Professor specific routes */}
            <Route
              path="/professor/channels"
              element={
                <PrivateRoute>
                  <ProfessorChannels />
                </PrivateRoute>
              }
            />
            <Route
              path="/professor/channels/create"
              element={
                <PrivateRoute>
                  <CreateChannel />
                </PrivateRoute>
              }
            />
             <Route
              path="/professor/channels/edit/:id"
              element={
                <PrivateRoute>
                  <CreateChannel /> {/* Reusing CreateChannel for editing */}
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          </Routes>
        </main>
      </div>
      <JarvisChatbot />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider translations={TEXT_TRANSLATIONS}>
      <AppContent />
    </AuthProvider>
  );
};

export default App;