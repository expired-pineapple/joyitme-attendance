import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';


export async function POST(req: NextRequest, res: NextResponse) {
  
  const { token, password } = await req.json();

  try {
    const user = await db.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while resetting your password.'  }, { status: 500 });

  }
}