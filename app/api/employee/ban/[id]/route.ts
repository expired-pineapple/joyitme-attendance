import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 403});
        let message = ""

        const query: any = {
            where: {
                id: params.id
            },
            include: {
                user: true
            }
        }

      

        const employee = await db.employee.findUnique(query);

        if(!employee) return NextResponse.json({error: "Employee not found"}, {status: 404});

        // @ts-ignore
        if((employee?.user.isAdmin || employee?.user.isManager) && user.isManager){
            return NextResponse.json({message: "You can't ban admin or manager"}, {status: 400});
        }

        // @ts-ignore
        if(employee?.user.isBanned){
         await db.employee.update({
                where: {
                    id: params.id
                },
            data: {
                user:{
                   update:{
                    isBanned: false
                   }
                }
            },
         })
         message = "Employee unbanned successfully."
         return NextResponse.json({message: message}, {status: 200});
        }else{
            await db.employee.update({
                where: {
                    id: params.id
                },
            data: {
                user:{
                   update:{
                    isBanned: true
                   }
                }
            },
         })
         message="Employee banned successfully."
         return NextResponse.json({message: message}, {status: 200});
        }


        
        
    }catch(error: any){
        ;
        return NextResponse.json({message: "Something went wrong"}, {status: 500});
    }
}


    
