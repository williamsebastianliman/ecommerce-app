import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY, USER_ID_KEY } from '../decorators/auth.decorators';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RoleType } from '../types/role.types';
import type { JwtPayload } from '../types/role.types';
import { RequestWithUser } from '../types/request.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiresUserId = this.reflector.getAllAndOverride<boolean>(
      USER_ID_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!this.isValidJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = payload;

      if (requiredRoles?.length && !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('Insufficient role permissions');
      }

      if (requiresUserId) {
        const requestedUserId = this.extractUserIdFromRequest(request);
        if (requestedUserId && requestedUserId !== payload.sub) {
          throw new ForbiddenException(
            'Cannot access resources of other users',
          );
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractUserIdFromRequest(request: Request): string | undefined {
    interface RequestWithUserId {
      userId?: string;
    }

    if (request.body && 'userId' in request.body) {
      return (request.body as RequestWithUserId).userId;
    }

    const queryUserId = request.query.userId;
    if (queryUserId) {
      const userId = Array.isArray(queryUserId) ? queryUserId[0] : queryUserId;
      return typeof userId === 'string' ? userId : undefined;
    }

    if (request.params && 'userId' in request.params) {
      return (request.params as RequestWithUserId).userId;
    }

    return undefined;
  }

  private isValidJwtPayload(payload: unknown): payload is JwtPayload {
    if (!payload || typeof payload !== 'object') return false;
    const { sub, role } = payload as JwtPayload;
    if (!sub || !role) return false;
    if (typeof sub !== 'string') return false;
    if (!Object.values(RoleType).includes(role)) return false;
    return true;
  }
}
