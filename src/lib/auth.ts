import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";
import "@/lib/env";

const prisma = getPrisma();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/photoslibrary.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Ensure user exists in database on first login
      if (account?.provider === "google" && profile?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name ?? null,
              image: (profile as Record<string, unknown>).picture as string ?? null,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
