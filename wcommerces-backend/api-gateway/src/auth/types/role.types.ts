// Re-export the canonical role/JWT types from the DTO module so all
// parts of the gateway share a single source of truth.
import { RoleType } from '../dto/role.types';
import type { JwtPayload as DtoJwtPayload } from '../dto/role.types';

export { RoleType };

// Alias names used across the codebase to keep backwards compatibility
export type UserRole = RoleType;
export type JwtPayload = DtoJwtPayload;
