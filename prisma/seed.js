import bycrpt from "bcrypt";
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()


const userData =  async() =>{
    try{
    const hashedPassword = await bycrpt.hash("admin", 10);
    const userData = {
        name: "Admin",
        employeeNumber: "admin",
        password: hashedPassword,
        isAdmin: true
    }

    const user = await prisma.user.create({
        data: userData,
      });

      console.log(user)

    }catch(e){
        console.log(e)
    }
}

userData()