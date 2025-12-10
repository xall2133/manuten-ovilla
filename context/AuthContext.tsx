import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    // Simulate login
    // Using Deep Blue/Purple for admin
    setUser({
      id: 'u1',
      name: role === 'admin' ? 'SysAdmin' : 'Field Operator 01',
      email: role === 'admin' ? 'admin@m360.com' : 'op@m360.com',
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=3b82f6&color=fff&rounded=true`,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};