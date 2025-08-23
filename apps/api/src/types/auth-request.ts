import { Request } from 'express';
import { User } from '@madfam/shared';

export interface AuthenticatedRequest extends Request {
  user: User;
}
