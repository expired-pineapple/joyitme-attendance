import { NextRequest, NextResponse } from "next/server";
import moment from 'moment-timezone';
import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const { id } = params;
        const body = await request.json();
        const { date, check_in_time, check_out_time, timezone } = body;

        if (!date || !check_in_time || !check_out_time || !timezone) {
            return NextResponse.json({ error: "Date, check-in time, check-out time, and timezone are required" }, { status: 400 });
        }

        // Create moment objects based on the provided timezone
        const attendanceDate = moment.tz(date, timezone);
        const checkInTime = moment.tz(`${date} ${check_in_time}`, timezone);
        const checkOutTime = moment.tz(`${date} ${check_out_time}`, timezone);

        // Adjust check-out time if it is before check-in time
        if (checkOutTime.isBefore(checkInTime)) {
            checkOutTime.add(1, 'day');
        }

        const attendance = await db.checkInOut.create({
            data: {
                employeeId: id,
                date: attendanceDate.toDate(),
                check_in_time: checkInTime.toDate(),
                check_out_time: checkOutTime.toDate(),
            },
        });

        return NextResponse.json({ message: "Attendance registered successfully", attendance }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}