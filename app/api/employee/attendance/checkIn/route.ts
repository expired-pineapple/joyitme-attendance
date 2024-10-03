// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if the user is associated with an employee
    const employee = await db.employee.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "User is not associated with an employee" },
        { status: 404 }
      );
    }

    // Get the current date
    const currentDate = new Date();

    // Find ongoing check-in session
    const recentSession = await db.checkInOut.findFirst({
      where: {
          employeeId: employee.id,
          date: { gte: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) }
      }
  });
    // Check if there is an ongoing check-in session
    const ongoingSession = recentSession
      ? recentSession.check_out_time === null
      : false;

    if (
      recentSession?.check_in_time !== null &&
      currentDate.getDate() === recentSession?.date.getDate()
    ) {
      return NextResponse.json(
        { message: "You have already checked in today" },
        { status: 400 }
      );
    }


    console.log(currentDate)

    const checkIn = await db.checkInOut.create({
      data: {
        employeeId: employee.id,
        date: currentDate,
        check_in_time: currentDate,
        check_out_time: null,
      },
    });


    return NextResponse.json(
      { message: "Check-in successful", checkIn },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}
