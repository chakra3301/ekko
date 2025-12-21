// NextAuth API route handler
// Handles all authentication requests (sign in, sign out, callbacks, etc.)
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

