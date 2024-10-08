import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { calculateEarnings } from "@/lib/calculateEarnings";


export async function GET(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        const userLocation =  user.location.map((l)=>{
          return l.locationId
        })
        let payrollPeriods;
        if(!user.isAdmin){
            payrollPeriods = await db.payrollPeriod.findMany({
              where:{
                locations:{
                  every:{
                    locationId:{
                      in: userLocation
                      
                    }
                    
                  }
                }
              },
              include:{
                locations:{
                  include:{
                    location:true
                  }
                }
              }
            });
        }else{
          payrollPeriods = await db.payrollPeriod.findMany({
            include:{
              locations: {include:{
                location:true
              }}
            }
          });
        }
        return NextResponse.json(payrollPeriods.map((p)=>{
          return(
            {
              id:p.id,
              startDate: p.startDate,
              endDate:p.endDate,
              location: p.locations.length >0 ? p.locations[0].location?.name : "",
              budget:p.locations.length >0 ? p.locations[0].budget: "",
            }
          )
        }));
    }catch(error){
      console.log(error)
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
  }


export async function POST(request: NextRequest) {
    try{
        const user= await getCurrentUser();
        if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        if(!user.isAdmin && !user.isManager) return NextResponse.json({error: "Unauthorized"}, {status: 401});
        
        const body = await request.json();
        const budget = body.budget

        const parsedStartDate = new Date(body.startDate);
        const parsedEndDate = new Date(body.endDate);

        const attendances = await db.checkInOut.findMany({
          where:{
            date:  {
              gte: new Date(parsedStartDate),
              lte: new Date(parsedEndDate)
            },
            employee:{
              user: {
                location: {
                  every: {
                    locationId: body.locationId
                  }
                },
                isBanned: false
              }
            }
          }
        })

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
           
        },
          include: {
            user: true,
            timestamps: true,
          },
        })

        if(attendances.length === 0){
          return NextResponse.json({message: "No recorded attendance in selected time range"}, {status: 400});
        }

        
        const payrollPeriod = await db.payrollPeriod.create(
          {
              data: {
                  startDate: body.startDate,
                  endDate: body.endDate
              }
          }
      )


        const payrollLocation = await db.payrollLocation.create(
          {
              data: {
                  payrollId: payrollPeriod.id,
                  locationId: body.locationId,
                  budget: budget

              }
          }
      )

        for (const employee of employees) {
          let totalWorkedHours = 0;
          for (let i = 0; i < attendances.length;) {

            const checkInTime = attendances[i].check_in_time;
            const checkOutTime = attendances[i]?.check_out_time 
            let duration = 0
            if(checkOutTime !== null){
              duration = checkOutTime.getTime() - checkInTime.getTime()
            }

            totalWorkedHours += duration / (1000 * 60 * 60);

           i+=1
          }


          
          const { formula } = employee;
          const earnings = calculateEarnings(formula, totalWorkedHours);
          const earnings_fixed = earnings;
          const totalWorkedHours_fixed = totalWorkedHours;
      
          await db.employeePayroll.create(
            {
                data: {
                    employeeId: employee.id,
                    payrollId: payrollLocation.id,
                    earnings: earnings_fixed,
                    totalWorkedHours: totalWorkedHours_fixed
                }
            }
        )
        }

        return NextResponse.json({data: "Payroll Period created successfully"}, {status: 201});
    }catch(error){
        
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }    
    
}
