import { getServerSession } from "next-auth/next"

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { db } from "@/lib/db";

export async function getSession() {
  return await getServerSession(authOptions)
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();
     // @ts-ignore
    if (!session?.user?.employeeNumber) {
      return null;
    }

    const currentUser = await db.user.findUnique({
      where: {
        // @ts-ignore
        employeeNumber: session.user.employeeNumber as string,
      },
      include:{
        employee: true,
        location: true
      }

    });

    if (!currentUser) {
      return null;
    }

    return currentUser
  } catch (error: any) {
    return null;
  }
}

