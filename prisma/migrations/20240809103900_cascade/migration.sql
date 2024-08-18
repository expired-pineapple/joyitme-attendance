-- DropForeignKey
ALTER TABLE "CheckInOut" DROP CONSTRAINT "CheckInOut_employeeId_fkey";

-- AddForeignKey
ALTER TABLE "CheckInOut" ADD CONSTRAINT "CheckInOut_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
