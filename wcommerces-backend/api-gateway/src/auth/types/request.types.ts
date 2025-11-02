import { Request } from 'express';
import type { JwtPayload } from '../dto/role.types';

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}
