import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | User[keyof User] | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (data && user) {
      return user[data];
    }

    return user;
  },
);
