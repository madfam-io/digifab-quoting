import { User as MadfamUser } from '@cotiza/shared';

declare global {
  namespace Express {
    interface Request {
      user?: MadfamUser;
    }
  }
}

export {};
