export type UserType = {
  id: string;
  email: string;
  role: string;
  name: string;
  address: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthResponse = {
  tokens: TokenResponse;
  user: UserType;
};
