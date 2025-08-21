import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    accessToken: string;
    refreshToken: string;
  }
}