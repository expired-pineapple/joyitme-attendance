import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        employeeNumber: { label: "Employee Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.employeeNumber || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          let user;
          try{
              user= await db.user.findUnique({
                where: { employeeNumber: credentials.employeeNumber },
              });
            }catch(error){
                throw Error('Something went wrong')
              }

          if (!user) {
            throw new Error("Invalid credentials");
          }

          if (user.isBanned) {
            throw new Error("User is banned");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return user;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An unexpected error occurred");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub;
        //@ts-ignore
        session.user.employeeNumber = token.employeeNumber as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.employeeNumber = (user as User).employeeNumber;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);