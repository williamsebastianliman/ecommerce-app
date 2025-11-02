import { api } from "../lib/axios";
import type {
  AuthResponse,
  LoginDTO,
  MeResponse,
  RefreshTokenDTO,
  RegisterDTO,
  TokenResponse,
} from "../dto/auth.dto";

export const register = (dto: RegisterDTO) =>
  api.post<AuthResponse>("/register", dto).then((r) => r.data);
export const login = (dto: LoginDTO) =>
  api.post<AuthResponse>("/login", dto).then((r) => r.data);
export const refresh = (dto: RefreshTokenDTO) =>
  api.post<TokenResponse>("/refresh", dto).then((r) => r.data);
export const me = () => api.get<MeResponse>("/me").then((r) => r.data);
