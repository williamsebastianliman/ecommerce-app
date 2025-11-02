export type Role = "ADMIN" | "SELLER" | "USER";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: Role };
};

export type TokenResponse = { accessToken: string; refreshToken: string };

export type RegisterDTO = {
  email: string;
  password: string;
  name: string;
  address: string;
};
export type LoginDTO = { email: string; password: string };
export type RefreshTokenDTO = { refreshToken: string };

export type MeResponse = { id: string; email: string; role: Role };
