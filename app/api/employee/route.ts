import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: NextRequest) {
    try {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  
      let whereCondition: any = {
        user: {
          isManager: false,
          isAdmin: false,
        }
      };

      const locations = await db.userLocation.findMany({
        where: { userId: user.id },
        select: { locationId: true }
      });
        
      if (user.isManager) {  
        whereCondition.user.location = {
          some:{
              locationId: {
              in: locations.map((l)=>{
                  return l.locationId
              })
          }
          }
      }
      }
      
      const employees = await db.employee.findMany({
        where:whereCondition,
        include: {
          user: {
            include: {
              location: {
                include: {
                  location: true
                }
              }
            }
          }
        }
      });
  
      const formattedEmployees = employees.map(employee => ({
        ...employee,
        name: employee.user.name,
        employeeNumber: employee.user.employeeNumber.toUpperCase(),
        location: employee.user.location[0]?.location.name || 'No location'
      }));
  
      return NextResponse.json(formattedEmployees);
    } catch (error) {
      console.error("Error in GET function:", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }


