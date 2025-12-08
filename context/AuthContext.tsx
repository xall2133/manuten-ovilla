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
    // Using Blue (2563EB) background for avatars
    setUser({
      id: 'u1',
      name: role === 'admin' ? 'Administrador Geral' : 'Operador de Campo',
      email: role === 'admin' ? 'admin@villaprivilege.com.br' : 'op@villaprivilege.com.br',
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=2563EB&color=fff`,
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