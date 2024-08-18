import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming this imports your Prisma client
import getCurrentUser from "@/app/actions/getCurrentUser";
import { calculateEarnings } from "@/lib/calculateEarnings";


export async function GET(
  request: NextRequest,

) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if(user.employee === null){
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    try {
      const payroll = await db.employeePayroll.findMany({
        where: {
            employeeId: user.employee?.id,
        },
        include:{
            employee:true
        }
    })

    let allTotalWorkedHours=0;
    let allEarnings=0;
    let allTotalOverTime=0;
    let allProjectedPay=0;
    let allOvertimePay=0;
    let allOvertimeHours=0;

    const payrollResponse = payroll.map((payroll) => {
      const formula = user.employee?.formula || "";
      const projectedPay = calculateEarnings(formula, user.employee?.projectedHour || 0);
      const netPay =  payroll.earnings
      let overtimePay = netPay - projectedPay
      if((netPay - projectedPay) < 0){
        overtimePay = 0
      }
      allTotalWorkedHours +=payroll.totalWorkedHours
      allEarnings+=netPay
      allTotalOverTime+=overtimePay
      allProjectedPay+=projectedPay
      allOvertimePay+=overtimePay
      allOvertimeHours+=(payroll.totalWorkedHours - (user.employee?.projectedHour || 0))

      return {        
          id: payroll.id,
          employeeNumber: user.employeeNumber,
          employeeName:user.name,
          totalWorkedHours: payroll.totalWorkedHours.toFixed(2),
          earnings: netPay.toFixed(2),
          overtimeHours: (payroll.totalWorkedHours - (user.employee?.projectedHour || 0)).toFixed(2),
          projectedHour: user.employee?.projectedHour,
          projectedPay: projectedPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          confirmation: payroll.confirmation,

      }})

      const totals = {
        totalWorkedHours: allTotalWorkedHours.toFixed(2),
        earnings: allEarnings.toFixed(2),
        overtimeHours: allOvertimeHours.toFixed(2),
        projectedHour: allProjectedPay.toFixed(2),
        projectedPay: allProjectedPay.toFixed(2),
        overtimePay: allOvertimePay.toFixed(2),
        totalOverTime: allTotalOverTime.toFixed(2),
        confirmation: null
      }
    return  NextResponse.json({table: payrollResponse, totals: totals},  { status: 200 });
}
catch(error){
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
}
}