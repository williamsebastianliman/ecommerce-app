export enum RoleType {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string;
  role: RoleType;
  iat?: number;
  exp?: number;
}
