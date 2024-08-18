import { NextRequest, NextResponse } from "next/server";
import bycrpt from "bcrypt";
import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";


export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.isAdmin && !currentUser.isManager)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.formula) {
      return NextResponse.json({ message: "Formula is required" }, { status: 400 });
    }

    const password = body.password.toLowerCase().trim();
    
    // Check if the password contains special characters
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (specialChars.test(password)) {
      return NextResponse.json({ message: "Password cannot contain special characters" }, { status: 400 });
    }
    const hashedPassword = await bycrpt.hash(password, 10);

    const userUrl = `${process.env.BASE_URL}/login?employeeNumber=${body.employeeNumber}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userUrl}`;

    const result = await db.$transaction(async (prisma) => {
      const location = await prisma.location.findUnique({
        where: { id: body.location },
        select: { id: true }
      });

      if (!location) {
        throw new Error("Location not found");
      }

      const user = await prisma.user.create({
        data: {
          name: body.name,
          employeeNumber: body.employeeNumber.toLowerCase(),
          password: hashedPassword,
        },
      });

      const employee = await prisma.employee.create({
        data: {
          formula: body.formula,
          qrCode: qrCodeUrl,
          projectedHour: body.projectedHour,
          user: { connect: { id: user.id } },
        },
      });

      await prisma.userLocation.create({
        data: {
          userId: user.id,
          locationId: body.location,
        },
      });

      return { user, employee };
    }, {
      timeout: 25000 
    });

    return NextResponse.json({ message: "Employee created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Invalid employee data" }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}