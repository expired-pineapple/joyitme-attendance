import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from '@prisma/client';

import bycrpt from "bcrypt";


import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const currentUser = await getCurrentUser();

    if (!currentUser) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    if (!currentUser.isAdmin) return NextResponse.json({error: "Unauthorized"}, {status: 403});

    const body = await request.json();
    try {
        await createManagerWithLocations(body);
        return NextResponse.json({ message: "Manager created successfully" }, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}

async function createManagerWithLocations(body: any) {

    const { name, employeeNumber, formula, locations, password } = body;

    // Hash password
    const hashedPassword = await bycrpt.hash(password, 10);

    return await prisma.$transaction(async (prisma) => {
        // Check if all locations exist
        const existingLocations = await prisma.location.findMany({
            where: { id: { in: locations } }
        });

        if (existingLocations.length !== locations.length) {
            throw new Error('One or more invalid locations');
        }

        // Create the user
        const user = await prisma.user.create({
            data: {
                name: name,
                employeeNumber: employeeNumber.toLowerCase(),
                password: hashedPassword,
                isManager: true,
            },
        });

        // Create UserLocation entries for each location
        await prisma.userLocation.createMany({
            data: locations.map((locationId: string) => ({
                userId: user.id,
                locationId,
            })),
        });

        // Create employee
        const userUrl = `${process.env.BASE_URL}/login?employeeNumber=${employeeNumber}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(userUrl)}`;

        await prisma.employee.create({
            data: {
                formula: formula || "(A+0)",
                qrCode: qrCodeUrl,
                userId: user.id,
            },
        });

        return { user, password };
    });
}

function handleError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const target = error.meta?.target as string[];
            if (target && target.length > 0) {
                let field = target[0];
                if (field == "employeeNumber"){
                  field="Employee Number"
                }
                return NextResponse.json({ message: `${field} already exists` }, { status: 400 });
            }
        }
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
}

export async function GET(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        

        const employees = await db.employee.findMany({
            where:{
                user:{
                    isManager: true,
                }
            },
            include: {
                user: {
                    include:{
                        location:{
                            include:{
                                location:true
                            }
                        }
                    }
                }
            }
        });
        const e = employees.map(employee => {
            return {
                ...employee,
               name: employee.user.name,
               employeeNumber: employee.user.employeeNumber.toUpperCase(),
               locations: employee.user.location.map(loc => loc.location.name)
            }
        })
        return NextResponse.json(e);
    }catch(error){
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }




