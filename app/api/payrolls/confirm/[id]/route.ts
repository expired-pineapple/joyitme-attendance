import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db"; // Assuming this imports your Prisma client
import getCurrentUser from "@/app/actions/getCurrentUser";


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  if(currentUser.isBanned){
    return NextResponse.json({message:"You have been banned"}, {status:403})
  }

  if(!currentUser.employee == null){
    return NextResponse.json({message:"You are not an employee"}, {status:403})
  }

  try{
    const payroll = await db.employeePayroll.update({
        where:{
            id:id
        },
        data:{
            confirmation: true
        }
    })
    return NextResponse.json({message:"Payroll confirmed successfully"},{status:200})
  }catch(error){
    return NextResponse.json({message:"Something went wrong"}, {status:500})
  }
}