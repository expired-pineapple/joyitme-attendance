import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming this imports your Prisma client
import getCurrentUser from "@/app/actions/getCurrentUser";
import { calculateEarnings } from "@/lib/calculateEarnings";


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!user.isAdmin && !user.isManager) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let query: any = {
      where: {
        id,
      },
      include: {
        locations: {
          include: {
           location: true,
            employees: {
              include: {
                employee: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    }


    try {
      const payroll = await db.payrollPeriod.findUnique(query);

      if (!payroll) {
        return NextResponse.json({ message: "Payroll not found" }, { status: 404 });
      }

      let response = []
      let responsewithLocation = {}   
      let overallWorkedHours=0 
      let totalNetPay=0
      let totalProjectedPay=0
      let totalOverTime=0
      let totalProjectedHour=0
      let totalOverTimePay=0
      // @ts-ignore
      for (const location of payroll.locations) {
        for (const employee of location.employees) {
          const formula = employee.employee.formula;
          const projectedPay = calculateEarnings(formula, employee.employee.projectedHour);
          const netPay =  employee.earnings
          let overtimePay = netPay - projectedPay
          if((netPay - projectedPay) < 0){
            overtimePay = 0
          }
          response.push({
            id: employee.id,
            employeeNumber: employee.employee.user.employeeNumber.toUpperCase(),
            employeeName: employee.employee.user.name,
            totalWorkedHours: employee.totalWorkedHours.toFixed(2),
            earnings: netPay.toFixed(2),
            overtimeHours: (employee.totalWorkedHours - employee.employee.projectedHour).toFixed(2),
            projectedHour: employee.employee.projectedHour,
            projectedPay: projectedPay.toFixed(2),
            overtimePay: overtimePay.toFixed(2),
            confirmation: employee.confirmation,
          });

          overallWorkedHours+= ((employee.totalWorkedHours >0 ) ?  employee.totalWorkedHours : 0)
          totalOverTime+= ((employee.totalWorkedHours - employee.employee.projectedHour) >0 ? (employee.totalWorkedHours - employee.employee.projectedHour) : 0)
          totalNetPay+=(netPay >0 ? netPay : 0)
          totalProjectedPay+=projectedPay
          totalProjectedHour+=employee.employee.projectedHour
          totalOverTimePay+=overtimePay
        }

        response.push(
          {
            employeeNumber:"Total",
            employeeName:"Total",
            totalWorkedHours: overallWorkedHours.toFixed(2),
            earnings:totalNetPay.toFixed(2),
            overtimeHours: totalOverTime.toFixed(2),
            projectedHour: totalProjectedHour,
            projectedPay: totalProjectedPay.toFixed(2),
            overtimePay: totalOverTimePay.toFixed(2),
          
          }
        )

        responsewithLocation={
          startDate: new Date(payroll.startDate).toDateString(),
          endDate:  new Date(payroll.endDate).toDateString(),
          budget: location.budget,
          locationName: location?.location?.name.toLocaleString(),
          employees: response

        }
      }

      return NextResponse.json(responsewithLocation, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

}