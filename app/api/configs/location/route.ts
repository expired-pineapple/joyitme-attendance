import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";


export async function GET(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const locations = await db.location.findMany();
        return NextResponse.json({
            locations: locations,
            isManager: user.isManager
        });
    }catch(error){
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }


export async function POST(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        
        const body = await request.json();
        const location = await db.location.create(
            {
                data: body
            }
        )
        return NextResponse.json({data: location}, {status: 201});
    }catch(error){
        
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
    
}


export async function PUT(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const body = await request.json();
        const id = body.id
        delete body.id

        const location = await db.location.update(
            {
                where: { id: id },
                data: body
            }
        )
        if(!location) return NextResponse.json({error: "Location not found"}, {status: 404});
        return NextResponse.json(location);
    }catch(error){
        
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
    
}
