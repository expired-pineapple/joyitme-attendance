  import { NextRequest, NextResponse } from "next/server";
  import { db } from "@/lib/db";
  import getCurrentUser from "@/app/actions/getCurrentUser";


  export async function GET(request: NextRequest) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const query = request.nextUrl.searchParams;
      const { dateFilter, whereCondition } = await buildQueryConditions(query, user);

      const attendances = await db.checkInOut.findMany({
        where: whereCondition,
        select: {
          id: true,
          check_in_time: true,
          check_out_time: true,
          date: true,
          edited:true,
          remark:true,
          employee: { 
            select: {
              user: { 
                select: { 
                  employeeNumber: true,
                  name: true,
                  location: {
                   include:{
                    location:true
                   }
                  }
                } 
              }
            } 
          },
        },
      });

      const { attendanceWithEmployeeName, hasCheckInToday, hasCheckOutToday } = processAttendances(attendances);

      return NextResponse.json(
        { 
          attendanceWithEmployeeName, 
          hasCheckInToday, 
          hasCheckOutToday, 
          isAdmin: user.isAdmin,
          isManager: user.isManager
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }

  async function buildQueryConditions(query: URLSearchParams, user: any) {
    const filterStartDate = query.get("startDate");
    const filterEndDate = query.get("endDate");
    const filterLocations = query.getAll("locations[]");
    const filter = query.get("filter")?.toLowerCase();
  
    let dateFilter: any = {};
    if (filterStartDate && filterEndDate) {
      dateFilter = {
        gte: new Date(filterStartDate),
        lte: new Date(filterEndDate),
      };
    } else if (filter === "today") {
      const currentDate = new Date();
      dateFilter = {
        gte: new Date(currentDate.setHours(0, 0, 0, 0)),
        lte: new Date(currentDate.setHours(23, 59, 59, 999)),
      };
    }
  
    let whereCondition: any = { date: dateFilter };
    
    if (filterLocations.length > 0) {
      whereCondition.employee = {
        user: {
          location: {
            some: {
              locationId: {
                in: filterLocations
              }
            }
          }
        }
      };
    }
    
    if (!user.isAdmin) {
      if (user.isManager) {
        const managerLocations = await db.userLocation.findMany({
          where: { userId: user.id },
          select: { locationId: true }
        });
        const locationIds = managerLocations.map(loc => loc.locationId);
        
        whereCondition.employee = {
          user: {
            location: {
              some: {
                locationId: {
                  in: locationIds
                }
              }
            }
          }
        };
      } else {
        whereCondition.employee = { userId: user.id };
      }
    }
  
    return { dateFilter, whereCondition };
  }

  function processAttendances(attendances: any[]) {
    const today = new Date().toDateString();
    let hasCheckInToday = false;
    let hasCheckOutToday = false;

    const attendanceWithEmployeeName = attendances.map((attendance) => {
      const check_in_time = new Date(attendance.check_in_time);
      let duration = null;
      let check_out_time = null;

      if (attendance.check_out_time) {
        const check_out_time_date = new Date(attendance.check_out_time);
        const timeDiff = check_out_time_date.getTime() - check_in_time.getTime();
        const totalMinutes = Math.floor(timeDiff / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        duration = `${hours}hrs ${minutes}mins`;
        check_out_time = attendance.check_out_time;
      }

      const attendanceDate = new Date(attendance.date).toDateString();
      if (attendanceDate === today) {
        hasCheckInToday = true;
        if (check_out_time) hasCheckOutToday = true;
      }
      
      return {
        id: attendance.id,
        employeeNumber: attendance.employee.user.employeeNumber.toUpperCase(),
        date: attendance.date.toISOString().split('T')[0],
        check_in_time,
        check_out_time,
        employeeName: attendance.employee.user.name,
        duration,
        locations: attendance.employee.user.location[0].location.name,
        edited: attendance.edited,
        remark: attendance.remark 
      };
    });


    return { attendanceWithEmployeeName, hasCheckInToday, hasCheckOutToday };
  }
