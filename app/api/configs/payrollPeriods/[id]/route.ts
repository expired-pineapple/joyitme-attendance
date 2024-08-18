import { NextRequest, NextResponse } from "next/server";

import moment from "moment";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { calculateEarnings } from "@/lib/calculateEarnings";

export async function GET(request: NextRequest,  { params }: { params: { id: string } }) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const { id } = params;

        const payrollPeriod = await db.payrollPeriod.findUnique({
            where: {
                id: id
            },
            include:{
                locations:true
            }
            
        });
        const data = {
                startDate: moment(payrollPeriod?.startDate).format("YYYY-MM-DDTkk:mm"),
                endDate: moment(payrollPeriod?.endDate).format("YYYY-MM-DDTkk:mm"),
                locationId: payrollPeriod?.locations[0].locationId,
                budget:payrollPeriod?.locations[0].budget
            
              }
    
        return NextResponse.json(data);
    }catch(error){
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }


  export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const budget = body.budget;

        const parsedStartDate = new Date(body.startDate);
        const parsedEndDate = new Date(body.endDate);

        const { id } = params;

        
        console.log({id}, "PARAMS")
        const employees = await db.employee.findMany({
            where: {
                user: {
                    location: {
                        every: {
                            locationId: body.locationId
                        }
                    },
                    isBanned: false
                },
                timestamps: {
                    some: {
                        check_in_time: {
                            gte: parsedStartDate,
                            lte: parsedEndDate,
                        },
                    },
                },
            },
            include: {
                user: true,
                timestamps: true,
            },
        });

        if (employees.length === 0) {
            return NextResponse.json({ message: "No recorded attendance in selected time range" }, { status: 400 });
        }

        // Update or create PayrollPeriod
        let payrollPeriod = await db.payrollPeriod.findUnique({
            where: { id: id }
        });

        if (!payrollPeriod) {
            payrollPeriod = await db.payrollPeriod.create({
                data: {
                    id: id,
                    startDate: body.startDate,
                    endDate: body.endDate
                }
            });
        } else {
            payrollPeriod = await db.payrollPeriod.update({
                where: { id: id },
                data: {
                    startDate: body.startDate,
                    endDate: body.endDate
                }
            });
        }

        // Update or create PayrollLocation
        let payrollLocation = await db.payrollLocation.findFirst({
            where: {
                payrollId: payrollPeriod.id,
                locationId: body.locationId
            }
        });

        if (!payrollLocation) {
            payrollLocation = await db.payrollLocation.create({
                data: {
                    payrollId: payrollPeriod.id,
                    locationId: body.locationId,
                    budget: budget
                }
            });
        } else {
            payrollLocation = await db.payrollLocation.update({
                where: { id: payrollLocation.id },
                data: { budget: budget }
            });
        }

        // Clear existing EmployeePayroll entries
        await db.employeePayroll.deleteMany({
            where: { payrollId: payrollLocation.id }
        });

        // Create new EmployeePayroll entries
        for (const employee of employees) {
            const checkInsAndOuts = employee.timestamps;
            let totalWorkedHours = 0;

            for (let i = 0; i < checkInsAndOuts.length; i += 2) {
                const checkInTime = checkInsAndOuts[i].check_in_time;
                const checkOutTime = checkInsAndOuts[i]?.check_out_time;
                let duration = 0;
                if (checkOutTime !== null) {
                    duration = checkOutTime.getTime() - checkInTime.getTime();
                }

                if (i + 2 < checkInsAndOuts.length) {
                    totalWorkedHours += duration / (1000 * 60 * 60); // Convert milliseconds to hours
                } else {
                    totalWorkedHours += duration / (1000 * 60 * 60);
                    break;
                }
            }

            const { formula } = employee;
            const earnings = calculateEarnings(formula, totalWorkedHours);
            const earnings_fixed = earnings;
            const totalWorkedHours_fixed = totalWorkedHours;

            await db.employeePayroll.create({
                data: {
                    employeeId: employee.id,
                    payrollId: payrollLocation.id,
                    earnings: earnings_fixed,
                    totalWorkedHours: totalWorkedHours_fixed
                }
            });
        }

        return NextResponse.json({ data: "Payroll Period updated successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


        const { id } = params;

        const result = await db.$transaction(async (tx) => {
            // Delete associated EmployeePayroll entries
            await tx.employeePayroll.deleteMany({
                where: {
                    payroll: {
                        payrollId: id
                    }
                }
            });

            // Delete associated PayrollLocation entries
            await tx.payrollLocation.deleteMany({
                where: {
                    payrollId: id
                }
            });

            // Delete the PayrollPeriod
            const deletedPayrollPeriod = await tx.payrollPeriod.delete({
                where: {
                    id: id
                }
            });

            if (!deletedPayrollPeriod) {
                throw new Error("Payroll Period not found");
            }

            return { message: "Payroll Period deleted successfully" };
        });

        return NextResponse.json({ message: result.message }, { status: 200 });
    } catch (error:any) {
        return NextResponse.json({message: "Something went wrong" }, { status: 500 });
    }
}