import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";


export async function GET(request: NextRequest,  { params }: { params: { id: string } }) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin ) return NextResponse.json({error: "Unauthorized"}, {status: 403});

        const { id } = params;

        const location = await db.location.findUnique({
            where: {
                id: id
            },
            
        });

        return NextResponse.json(location);
    }catch(error){
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }





  export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin )  return NextResponse.json({error: "Unauthorized"}, {status: 403});

        const { id } = params;

        const body = await request.json();

        const location = await db.location.update({
            data: body,
            where: {
                id: id
            }
        });

        return NextResponse.json({message:"Location updated successfully"}, {status: 200});
    }catch(error){
        ;
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin )  return NextResponse.json({error: "Unauthorized"}, {status: 403});
        const location = await db.location.delete({
            where: {
                id: params.id
            }
        });


    } catch(error){
        
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }
    return NextResponse.json({message:"Location deleted successfully"}, {status: 200});
}