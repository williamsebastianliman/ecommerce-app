import { RoleType } from './role.types';

export class MeResponse {
  id: string;
  email: string;
  role: RoleType;
  isSeller: boolean;

  constructor(id: string, email: string, role: RoleType) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.isSeller = role === RoleType.SELLER;
  }
}
