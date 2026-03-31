import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, userProfiles, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.email) return null;

        // Get password from accounts table (stored as access_token for credentials)
        const account = await db.query.accounts.findFirst({
          where: eq(accounts.userId, user.id),
        });

        if (!account?.access_token) return null;

        const isValid = await bcrypt.compare(password, account.access_token);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Refresh profile fields on every token use so they stay current
      if (token.id) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, token.id as string),
        });
        token.role = profile?.role ?? "buyer";
        token.isProfileComplete = profile?.isProfileComplete ?? false;
        token.subscriptionTier = profile?.subscriptionTier ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        session.user.subscriptionTier = token.subscriptionTier as string;
      }
      return session;
    },
  },
});

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isProfileComplete: boolean;
      subscriptionTier: string;
    };
  }
}
