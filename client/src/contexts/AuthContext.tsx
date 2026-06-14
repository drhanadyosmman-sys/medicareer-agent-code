import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { store, User } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const login = (email: string, password: string): boolean => {
    const loggedIn = store.login(email, password);
    if (loggedIn) {
      setUser(loggedIn);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    const registered = store.register(name, email, password);
    if (registered) {
      setUser(registered);
      return true;
    }
    return false;
  };

  const logout = () => {
    store.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
