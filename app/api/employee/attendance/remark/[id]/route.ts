// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (!user.isAdmin && !user.isManager) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  
      const { id } = params;
      const body = await request.json();
      console.log(id)
      const data = await db.checkInOut.update({
        where: { id: id },
        data: body

      })
      console.log(data)
      return NextResponse.json({ message: "Remark Added successfully" }, { status: 200 });
    }catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
}