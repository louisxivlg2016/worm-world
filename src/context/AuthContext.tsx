import { createContext, useContext, type PropsWithChildren } from "react";

interface AuthContextValue {
  identity: string | null;
}

const AuthContext = createContext<AuthContextValue>({ identity: null });

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <AuthContext.Provider value={{ identity: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
