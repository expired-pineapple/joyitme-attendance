import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";

    export async function GET(request: NextRequest,  { params }: { params: { id: string } }) {
        try{
            const user= await getCurrentUser();
            if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
            if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 401});

            const { id } = params;

            const attendance = await db.checkInOut.findUnique({
                where: {
                    id: id
                },
            select:{
                check_in_time: true,
                check_out_time: true,
            }
            });
            const response = {
                check_in_time: attendance?.check_in_time.getTime(),
                check_out_time: attendance?.check_out_time?.getTime(),
            }

            return NextResponse.json(response, {status: 200});
        }catch(error){
            return NextResponse.json({error: "Something went wrong"}, {status: 500});
        }    
    }
    export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
      try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
        const { id } = params;
        const body = await request.json();
        const { check_in_time, check_out_time, timezone } = body;
        console.log(check_in_time, "CHECK IN TIME")
        console.log(check_out_time, "CHECK Out TIME")
        if (!timezone) return NextResponse.json({ error: "Timezone is required" }, { status: 400 });
    
        const attendance = await db.checkInOut.findUnique({
          where: { id: id },
        });
    
        if (!attendance) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    
        const data: any = {};
    
        if (check_in_time) {
          const [hours, minutes] = check_in_time.split(':');
          const localCheckInDate = new Date(attendance.check_in_time);
          console.log(localCheckInDate, "Local")
          localCheckInDate.setUTCHours(parseInt(hours), parseInt(minutes));
          data.check_in_time = localCheckInDate
          console.log(data.check_in_time, "Updated Data")
        }


            
        if (check_out_time && attendance.check_out_time) {
          const [hours, minutes] = check_out_time.split(':');
          const localCheckOutDate = new Date(attendance.check_out_time);
          localCheckOutDate.setUTCHours(parseInt(hours), parseInt(minutes));
          data.check_out_time = localCheckOutDate
        }

        if (data.check_in_time && data.check_out_time) {
          if (data.check_out_time < data.check_in_time) {
            data.check_in_time.setDate(attendance.date.getDate() - 1);
          }
        }
        if(data.check_out_time){

        const timeDiff = data.check_out_time.getTime() - data.check_in_time.getTime();
        const totalMinutes = Math.floor(timeDiff / 60000);
        const hours = totalMinutes / 60
       
        if(hours >24){
          data.check_in_time.setDate(attendance.date.getDate());
          data.check_out_time.setDate(attendance.date.getDate());
        }
      }
    
        await db.checkInOut.update({
          where: { id: id },
          data: data,
        });
    
        return NextResponse.json({ message: "Attendance updated successfully" }, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
      }
    }