export enum RoleType {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string; // User ID
  role: RoleType;
  iat?: number; // Issued at
  exp?: number; // Expiration
}
