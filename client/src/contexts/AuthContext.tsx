import { createContext, useCallback, useContext, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

/** The user shape the server is willing to publish. Mirrors server/publicUser.ts. */
export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  /** True until the first `auth.me` response lands. Guard redirects on this. */
  loading: boolean;
  /** Resolves with the signed-in user, so callers can act on it without waiting for a re-render. */
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();

  // The session lives in an httpOnly cookie, so the server is the only thing
  // that can tell us who we are - never trust a copy kept in localStorage.
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await loginMutation.mutateAsync({ email, password });
      utils.auth.me.setData(undefined, user);
      return user as AuthUser;
    },
    [loginMutation, utils]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const user = await registerMutation.mutateAsync({ name, email, password });
      utils.auth.me.setData(undefined, user);
      return user as AuthUser;
    },
    [registerMutation, utils]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      // Drop the cached identity even if the call failed, so the UI cannot keep
      // showing someone as signed in after they asked to leave.
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const user = (meQuery.data as AuthUser | null | undefined) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: meQuery.isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
