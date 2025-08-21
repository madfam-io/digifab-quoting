import { User } from '@madfam/shared';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};