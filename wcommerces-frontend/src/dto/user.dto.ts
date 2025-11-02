export type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SELLER" | "USER";
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserDTO = {
  id: string;
  name: string;
  address: string;
};
