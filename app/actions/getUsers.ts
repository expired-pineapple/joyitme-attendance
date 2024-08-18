'use server'
import { PrismaClient } from '@prisma/client/edge'

const db = new PrismaClient()


export async function getUsers(){
   return await db.employee.findMany()

}