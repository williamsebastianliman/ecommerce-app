import { RoleType } from '../dto/role.types';

export interface UserWithRole {
  id: string;
  email: string;
  role: RoleType;
}
