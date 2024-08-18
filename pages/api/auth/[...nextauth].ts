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
       
        const user = await db.user.findUnique({
          where: { employeeNumber: credentials?.employeeNumber as string },
        });


        if (!user) {
          throw new Error("Invalid credentials");
        }
        if(user.isBanned) throw new Error("User is banned")
        try {
          const isValid = await bcrypt.compare(
            credentials?.password as string,
            user?.password as string
          );
          if (!isValid) {
            throw new Error("Invalid credentials");
          }
        } catch (error:any) {
          throw new Error(error);
        }

        return user;
      
    }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: '/verify-request'
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub as string;
        // @ts-ignore
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
  // jwt: {
  //   secret: process.env.AUTH_SECRET_KEY,
  // },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
