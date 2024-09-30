// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from '@/app/actions/getCurrentUser';
import { db } from "@/lib/db";
import keys from "@/app/api/employee/attendance/checkOut/spreadsheet-keys.json";
import { calculateEarnings } from "@/lib/calculateEarnings";

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
                user: true,
                timestamps: true
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
                return checkOut;
            })
        );
        console.log(currentDate)
        const payroll = await db.payrollPeriod.findFirst({
            where: {
                OR: [
                    {
                        startDate: { lte: currentDate },
                        endDate: { gte: currentDate }
                    }
                ]
            }
        });
        
        const payrollLocation = await db.payrollLocation.findFirst({
            where:{
                payrollId:payroll?.id
            }
        })
        console.log(payroll, "________________________________________")
        const refreshedEmployee = await db.employee.findUnique({
            where: { id: employee.id },
            include: {
                user: true,
                timestamps: true
            }
        });
        if(refreshedEmployee && payrollLocation){



        const employeePayroll = await db.employeePayroll.findFirst({
            where: {
                employeeId: employee.id,
                payrollId: payrollLocation?.id
            }
            
        })
        console.log(employeePayroll)
        const checkInsAndOuts = refreshedEmployee.timestamps;
        console.log(checkInsAndOuts)

        let totalWorkedHours = 0;
  
        // Calculate total worked hours using a loop with early termination
        for (let i = 0; i < checkInsAndOuts.length; i += 2) {
          const checkInTime = checkInsAndOuts[i].check_in_time;
          const checkOutTime = checkInsAndOuts[i]?.check_out_time 
          let duration = 0

          if(checkOutTime !== null){
            duration = checkOutTime.getTime() - checkInTime.getTime()
  
          }
          
          totalWorkedHours += duration / (1000 * 60 * 60); 
          console.log(totalWorkedHours)
  
        }
  
        const { formula } = employee;
        const earnings_fixed = calculateEarnings(formula, totalWorkedHours); ;
        const totalWorkedHours_fixed = totalWorkedHours;
        if(employeePayroll){
        const updatedPayroll = await db.employeePayroll.update({
            where:{
                id: employeePayroll?.id
            },
            data:{
                 earnings: earnings_fixed,
                    totalWorkedHours: totalWorkedHours_fixed
            }
        })}
        else{
            const updatedPayroll = await db.employeePayroll.create(
                {
                    data: {
                        employeeId: employee.id,
                        payrollId: payrollLocation?.id,
                        earnings: earnings_fixed,
                        totalWorkedHours: totalWorkedHours_fixed
                    }
                }
            )
        }
        }
        console.log("______________Saved Data_____________")

        
        return NextResponse.json({ message: "Check-out successful", updatedSessions }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await db.$disconnect();
    }
}