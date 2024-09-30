import { NextRequest, NextResponse } from "next/server";

import moment from 'moment'

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";

    export async function GET(request: NextRequest,  { params }: { params: { id: string } }) {
        try{
            const user= await getCurrentUser();
            if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
            if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

            const { id } = params;

            const attendance = await db.checkInOut.findUnique({
                where: {
                    id: id
                },
            select:{
                date: true,
                check_in_time: true,
                check_out_time: true,
                remark:true
            }
            });

            const response = {
                date: moment(attendance?.date).format("YYYY-MM-DD"),
                check_in_time: attendance?.check_in_time.getTime(),
                check_out_time: attendance?.check_out_time?.getTime(),
                remark: attendance?.remark
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
        if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    
        const { id } = params;
        const body = await request.json();
        const { date, check_in_time, check_out_time, timezone, remark } = body;

        if (!timezone) return NextResponse.json({ error: "Timezone is required" }, { status: 400 });
    
        const attendance = await db.checkInOut.findUnique({
          where: { id: id },
        });
    
        if (!attendance) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    
        const data: any = {};
        const newDate = new Date(date)
        attendance.date = newDate
        data.date=newDate
        data.remark=remark
    
        if (check_in_time) {
          const [hours, minutes] = check_in_time.split(':');
          const localCheckInDate = new Date(attendance.check_in_time);
          localCheckInDate.setUTCHours(parseInt(hours), parseInt(minutes));
          data.check_in_time = localCheckInDate
        }


            
        if (check_out_time) {
          const [hours, minutes] = check_out_time.split(':');
          const localCheckOutDate = attendance.check_out_time ? new Date(attendance.check_out_time) : new Date(date);
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
    
      data.edited=true
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