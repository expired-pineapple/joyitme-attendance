export interface Attendance {
  id: string;
  employeeNumber: string;
  employeeName: string;
  location: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  duration: string;
  hasCheckedInToday: boolean;
  hasCheckedOutToday: boolean;
}


export interface User{
  id: string;
  name: string;
  employeeNumber: string;
  isBanned: boolean
}

export interface timestamp{
    id: string;
    employeeId: string;
    date: string;
    check_in_time: string;
    check_out_time: string;

}

export interface Employee{
    id: string;
    employeeNumber?: string;
    locations?:string[];
    user: User;
    timestamps: timestamp[]
    formula: string;
    hasCheckedInToday: boolean;
    hasCheckedOutToday: boolean;
    projectedHours: number;
}

export interface Location{
  id: string;
  name: string;
  image: string;
  budget: number | null;
  employees: Employee[]
}

export interface EmployeePayroll{
  id: string;
  employeeId: string;
  employee: Employee;
  payrollId: string;
  payroll: PayrollLocation;
  projectedHour: number | null;
  remark: string | null;

}

export interface PayrollLocation{
  id: string;
  payrollId: string;
  payroll: PayrollPeriod;
  locationId: string;
  location: Location;
  budget: number | null;
  employees: EmployeePayroll[]
}


export interface PayrollPeriod {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  locations: PayrollLocation[]
}


export interface Payroll{
  id: string
  user: User;
  earnings: number;
  employeeId: string;
  employeeName:string;
  endDate: string | Date;
  startDate: string | Date;
  totalWorkedHours: number;
  confirmation: boolean;
  overtimeEarnings: number;
  overtimeHours: number;
  projectedPay: number;
  overtimePay: number;
}