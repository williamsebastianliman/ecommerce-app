type UserType = {
  id: string;
  email: string;
  role: string;
  name: string;
  address: string;
};

export type AuthResponse = {
  accessToken: string;
  user: UserType;
};
