import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import {
  createGuestUser,
  getUserByPhoneNumber,
  createUserWithPhone,
  upsertUserProfile,
} from "@/lib/db/queries";
import { createGHLContact } from "@/lib/ghl";
import { sendIMessage } from "@/lib/sendblue";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "phone",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        isRegister: { label: "Register", type: "text" },
      },
      async authorize(credentials) {
        const phone = String(credentials.phone ?? "").trim();
        const isRegister = credentials.isRegister === "true";

        if (!phone) return null;

        if (isRegister) {
          const name = String(credentials.name ?? "").trim();
          const email = String(credentials.email ?? "").trim();

          if (!name || !email) return null;

          // Check if phone already exists
          const existing = await getUserByPhoneNumber(phone);
          if (existing) {
            return { ...existing, type: "regular" };
          }

          const newUser = await createUserWithPhone({ phone, name, email });

          // Sync phone to UserProfile + send to GHL + welcome iMessage (all background)
          upsertUserProfile(newUser.id, { phone }).catch(() => null);
          createGHLContact({ phone, name, email }).catch(() => null);
          sendIMessage(
            phone,
            `Hey ${name.split(" ")[0]}! Welcome to SlimZer0. I'm your AI weight loss coach. Text me anytime to log meals, track workouts, or check progress. Let's start - what's your current weight?`
          ).catch(() => null);

          return { ...newUser, type: "regular" };
        }

        // Login: look up by phone
        const existingUser = await getUserByPhoneNumber(phone);
        if (!existingUser) return null;

        return { ...existingUser, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
