import { createContext } from "react";
import type { Role, AuthResponse, MeResponse } from "../dto/auth.dto";

export type AuthState = {
  user?: MeResponse;
  token?: string;
  role?: Role;
  loading: boolean;
};
export type AuthContextType = AuthState & {
  setAuth: (r: AuthResponse) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  loading: true,
  setAuth: () => {},
  logout: () => {},
});
