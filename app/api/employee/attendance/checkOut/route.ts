// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from '@/app/actions/getCurrentUser';
import { db } from "@/lib/db";


export async function POST(request: NextRequest) {
    try {
        // Get the current user
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Check if the user is associated with an employee
        const employee = await db.employee.findUnique({
            where: { userId: user.id},
            include:{
                user: true
            }
        });

        if (!employee) {
            return NextResponse.json({ error: "User is not associated with an employee" }, { status: 404 });
        }

        // Get the current date
        const currentDate = new Date();

        // Find ongoing check-in sessions for the employee
        const ongoingCheckinSessions = await db.checkInOut.findMany({
            where: {
                employeeId: employee.id,
                check_out_time: null,
                date: { gte: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) }
            }
        });

        // Check if there are any ongoing check-in sessions
        if (ongoingCheckinSessions.length === 0) {
            return NextResponse.json({ message: "You haven't checked in yet" }, { status: 400 });
        }

        // Update the ongoing check-in sessions
        const updatedSessions = await Promise.all(
            ongoingCheckinSessions.map(async (session: { id: any; check_in_time: { getTime: () => number; }; }) => {
                const checkOut = await db.checkInOut.update({
                    where: { id: session.id },
                    data: { check_out_time: currentDate }
                });
             
                let duration = ''
                const check_out_time_date = new Date(currentDate);
                const timeDiff = check_out_time_date.getTime() - session.check_in_time.getTime();
                duration = (timeDiff / (1000 * 60 * 60)).toFixed(2);

                return checkOut;
            })
        );

        return NextResponse.json({ message: "Check-out successful", updatedSessions }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await db.$disconnect();
    }
}