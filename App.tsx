import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/ui/Layout';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { TaskList } from './components/pages/TaskList';
import { Settings } from './components/pages/Settings';
import { Visits } from './components/pages/Visits';
import { Schedule } from './components/pages/Schedule';
import { Painting } from './components/pages/Painting';
import { Purchases } from './components/pages/Purchases';

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="visits" element={<Visits />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="painting" element={<Painting />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="settings" element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
             <AppContent />
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
