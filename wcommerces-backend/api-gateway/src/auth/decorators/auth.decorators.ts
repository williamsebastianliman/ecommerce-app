import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '../types/role.types';
import { AuthGuard } from '../guards/auth.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const USER_ID_KEY = 'userId';
export const RequiresUserId = () => SetMetadata(USER_ID_KEY, true);

// Combined decorator for protected routes
export function Auth(...roles: UserRole[]) {
  const decorators = [UseGuards(AuthGuard)];

  if (roles.length) {
    decorators.push(Roles(...roles));
  }

  return applyDecorators(...decorators);
}

// Specific decorator for user-owned resource routes
export function AuthUser() {
  return applyDecorators(UseGuards(AuthGuard), RequiresUserId());
}
