// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from '@/app/actions/getCurrentUser';
import { db } from "@/lib/db";
import keys from "@/app/api/employee/attendance/checkOut/spreadsheet-keys.json";

const { google } = require('googleapis');
const sheets = google.sheets('v4');

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
            ongoingCheckinSessions.map(async (session) => {
                const checkOut = await db.checkInOut.update({
                    where: { id: session.id },
                    data: { check_out_time: currentDate }
                });

                // Append check-in data to Google Sheets
                const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
                const range = "Sheet1!A:E";
                let duration = ''
                const check_out_time_date = new Date(currentDate);
                const timeDiff = check_out_time_date.getTime() - session.check_in_time.getTime();
                duration = (timeDiff / (1000 * 60 * 60)).toFixed(2);
                const values = [[employee.user.employeeNumber, session.date.toISOString(), session.check_in_time.toLocaleTimeString(), currentDate.toLocaleTimeString(), duration]];

                try {
                    const authClient = await google.auth.getClient({
                        projectId: keys.project_id,
                        credentials: {
                            type: "service_account",
                            private_key: keys.private_key,
                            client_email: keys.client_email,
                            client_id: keys.client_id,
                            token_url: keys.token_uri,
                            universe_domain: "googleapis.com",
                        },
                        scopes: [
                            "https://www.googleapis.com/auth/spreadsheets",
                        ],
                    });
                    const request = {
                        spreadsheetId,
                        range,
                        valueInputOption: 'RAW',
                        insertDataOption: 'INSERT_ROWS',
                        resource: {
                            values,
                        },
                        auth: authClient,
                    };
                    await sheets.spreadsheets.values.append(request);
                } catch (error) {
                    console.error(error);
                    return NextResponse.json({ error: "Failed to append check-in data to Google Sheets" }, { status: 500 });
                }

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