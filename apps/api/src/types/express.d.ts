import { User as MadfamUser } from '@madfam/shared';

declare global {
  namespace Express {
    interface Request {
      user?: MadfamUser;
    }
  }
}

export {};