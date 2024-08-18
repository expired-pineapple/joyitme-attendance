import { NextRequest, NextResponse } from "next/server";;

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.isAdmin && !user.isManager)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        await db.$transaction(async (tx) => {
            const existingEmployee = await tx.employee.findUnique({
                where: { id },
                include: { user: { include: { location: true } } },
            });

            if (!existingEmployee) {
                throw new Error("Employee not found");
            }

            const { user: userData, locations, ...employeeData } = body;
            
            // Prepare user update data
            const userUpdateData: any = {
                ...userData,
            };
            const userLocation = userUpdateData.location;
            delete userUpdateData.location;
            // Handle locations update
            if (Array.isArray(userLocation) && userLocation.length > 0) {
                // First, delete all existing locations for this user
                await tx.userLocation.deleteMany({
                    where: { userId: existingEmployee.user.id }
                });

                // Then, create new locations
                userUpdateData.location = {
                    create: userLocation.map((locationId: string) => ({
                        // @ts-ignore
                        locationId: locationId.locationId
                    }))
                };
            }

            // Update user
            const updatedUser = await tx.user.update({
                where: { id: existingEmployee.user.id },
                data: userUpdateData,
                include: { location: true }
            });

            // Update employee
            const updatedEmployee = await tx.employee.update({
                where: { id },
                data: {
                    ...employeeData,
                    projectedHour: employeeData.projectedHour,
                },
            });

            return { updatedEmployee, updatedUser };
        }, {
            timeout: 10000,
            maxWait: 5000,
            isolationLevel: 'Serializable'
        });

        return NextResponse.json({ message: "Employee updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating employee:', error);
        if (error instanceof Error && error.message === "Employee not found") {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}


