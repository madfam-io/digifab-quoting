import { Request } from 'express';
import { User } from '@cotiza/shared';

export interface AuthenticatedRequest extends Request {
  user: User;
}
