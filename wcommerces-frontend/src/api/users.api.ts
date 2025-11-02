import { api } from "../lib/axios";
import type { UpdateUserDTO, UserResponseDto } from "../dto/user.dto";

export const getUserById = (id: string) =>
  api.get<UserResponseDto>(`/users/${id}`).then((r) => r.data);
export const updateUser = (dto: UpdateUserDTO) =>
  api.patch<UserResponseDto>("/users", dto).then((r) => r.data);
