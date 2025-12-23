// NextAuth configuration
// Handles authentication with Email and Google providers
// Uses JWT sessions for stateless authentication
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

/**
 * NextAuth configuration
 * Configure authentication providers and session management
 * Environment variables required:
 * - AUTH_URL or NEXTAUTH_URL: Your application URL (NextAuth v5 uses AUTH_URL)
 * - AUTH_SECRET or NEXTAUTH_SECRET: Secret for JWT encryption (NextAuth v5 uses AUTH_SECRET)
 *   Generate with: openssl rand -base64 32
 * - EMAIL_SERVER: SMTP server configuration (JSON string)
 * - EMAIL_FROM: Email address to send from
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 */
// Build providers array conditionally based on environment variables
import type { NextAuthConfig } from 'next-auth';

const providers: NextAuthConfig['providers'] = [];


// Add Email provider if configured (and not a placeholder)
if (process.env.EMAIL_SERVER && !process.env.EMAIL_SERVER.includes('example.com')) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    })
  );
}

// Add Google provider if configured (and not placeholders)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret'
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add test credentials provider if no other providers are configured
// This allows testing without external services
if (providers.length === 0) {
  providers.push(
    CredentialsProvider({
      name: 'Test Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text', optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: (credentials.name as string) || null,
                role: UserRole.ARTIST,
                profileCompleted: false,
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileCompleted: user.profileCompleted,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error in authorize:', error);
          return null;
        }
      },
    })
  );
}

// Validate required environment variables
// NextAuth v5 uses AUTH_SECRET, but fallback to NEXTAUTH_SECRET for compatibility
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  // eslint-disable-next-line no-console
  console.error(
    '⚠️  AUTH_SECRET (or NEXTAUTH_SECRET) is not set. Please add it to your .env.local file.\n' +
    '   NextAuth v5 uses AUTH_SECRET. Generate one with: openssl rand -base64 32\n' +
    '   Add to .env.local: AUTH_SECRET=your-generated-secret'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  // Only add adapter if using Email provider (required for Email, optional for JWT with Credentials)
  adapter: PrismaAdapter(prisma),

  providers,
  // Use default NextAuth pages (remove custom pages config to avoid 404s)
  // pages: {
  //   signIn: '/auth/signin',
  // },
  trustHost: true, // Required for NextAuth v5 in development
  session: {
    strategy: 'jwt' as const, // Use JWT for stateless sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /**
     * Called when a JWT is created or updated
     * Add user role and ID to the token
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = (user as { id: string }).id;
        token.email = (user as { email: string }).email;
        token.role = (user as { role: UserRole }).role;
        token.profileCompleted = (user as { profileCompleted: boolean }).profileCompleted;
      }

      // Handle session updates (e.g., when profile is completed)
      if (trigger === 'update' && session) {
        if ((session as { role?: UserRole }).role) {
          token.role = (session as { role: UserRole }).role;
        }
        if ((session as { profileCompleted?: boolean }).profileCompleted !== undefined) {
          token.profileCompleted = (session as { profileCompleted: boolean }).profileCompleted;
        }
      }

      return token;
    },
    /**
     * Called whenever a session is checked
     * Return user data from token
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.profileCompleted = token.profileCompleted as boolean;
      }
      return session;
    },
    /**
     * Called when a user signs in
     * Ensure User record exists in database with proper role
     * Note: For credentials provider, user creation happens in the authorize function
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: any) {
      // For credentials provider, user is already created in authorize
      if (account?.provider === 'credentials') {
        return true;
      }

      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user with default role (will be set during onboarding)
          // Default to ARTIST for now, but this should be set during sign-up flow
          const profileName = profile && typeof profile === 'object' && 'name' in profile
            ? (profile.name as string | undefined)
            : undefined;
          
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profileName || null,
              role: UserRole.ARTIST, // Default, can be changed during onboarding
              profileCompleted: false,
            },
          });
        }
        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in signIn callback:', error);
        // Don't block sign-in if database error (for testing)
        return true;
      }
    },
  },
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};

