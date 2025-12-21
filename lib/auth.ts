// NextAuth auth() helper for App Router
// Re-exports the auth function from NextAuth
import NextAuth from 'next-auth';
import { authOptions } from './nextauth';

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);

