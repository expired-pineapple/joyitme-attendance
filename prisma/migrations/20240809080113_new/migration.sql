-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Name',
    "password" TEXT NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "projectedHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qrCode" TEXT NOT NULL,
    "formula" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInOut" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "check_in_time" TIMESTAMP(3) NOT NULL,
    "check_out_time" TIMESTAMP(3),

    CONSTRAINT "CheckInOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLocation" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "locationId" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PayrollLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePayroll" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "confirmation" BOOLEAN NOT NULL DEFAULT false,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWorkedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remark" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePayroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomatedPayrollPeriod" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomatedPayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomatedPayrollLocation" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "locationId" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AutomatedPayrollLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomatedEmployeePayroll" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "confirmation" BOOLEAN NOT NULL DEFAULT false,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWorkedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remark" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomatedEmployeePayroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_key" ON "User"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_id_key" ON "UserLocation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_key" ON "Employee"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_qrCode_key" ON "Employee"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckInOut_id_key" ON "CheckInOut"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_id_key" ON "Location"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_id_key" ON "PayrollPeriod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollLocation_id_key" ON "PayrollLocation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePayroll_id_key" ON "EmployeePayroll"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutomatedPayrollPeriod_id_key" ON "AutomatedPayrollPeriod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutomatedPayrollLocation_id_key" ON "AutomatedPayrollLocation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutomatedEmployeePayroll_id_key" ON "AutomatedEmployeePayroll"("id");

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInOut" ADD CONSTRAINT "CheckInOut_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLocation" ADD CONSTRAINT "PayrollLocation_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLocation" ADD CONSTRAINT "PayrollLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayroll" ADD CONSTRAINT "EmployeePayroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePayroll" ADD CONSTRAINT "EmployeePayroll_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "PayrollLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedPayrollLocation" ADD CONSTRAINT "AutomatedPayrollLocation_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "AutomatedPayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedPayrollLocation" ADD CONSTRAINT "AutomatedPayrollLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedEmployeePayroll" ADD CONSTRAINT "AutomatedEmployeePayroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomatedEmployeePayroll" ADD CONSTRAINT "AutomatedEmployeePayroll_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "AutomatedPayrollLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
