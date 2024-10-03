'use client'
import React from "react"
import Link from 'next/link'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip"
import {Users2} from "lucide-react"
import { Button } from "@/components/ui/button"
import {Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet"
import { FiMapPin } from "react-icons/fi";
import { LuFileSignature } from "react-icons/lu"; 
import { RiAccountPinCircleLine } from "react-icons/ri";
import { MdWaves } from "react-icons/md";
import { CiLogout} from "react-icons/ci";
import { usePathname   } from "next/navigation"
import { BsClockHistory } from "react-icons/bs";
import { signOut } from "next-auth/react";

interface SidebarProps {
  admin?: boolean
  manager?: boolean
}



const SideBar: React.FC<SidebarProps> = ({admin, manager}) => {
  const r  = usePathname();
  const isAttendance = r === "/"
  const isEmployee = r === "/employee"
  const isLocation = r === '/configs/location'
  const isPayrollPeriods = r === '/payrollPeriods'
  const isManager = r === '/managers'
  const isPayroll = r === '/employee/payroll'


    return( 
      <div>
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background lg:flex">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <MdWaves className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">MQ</span>
          </Link>
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isAttendance ? "bg-accent text-black" : ""}`
                }
              >
                <LuFileSignature className={`h-5 w-5  ${isAttendance ? "text-black " : ""}`} />
                <span className="sr-only">Attendance</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Attendance</TooltipContent>
          </Tooltip>
          </TooltipProvider>
          {(admin || manager ) && (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/employee"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isEmployee ? "bg-accent text-black " : ""}`
                }
              >
                <Users2 className={`h-5 w-5  ${isEmployee ? "text-black " : ""}`} />
                <span className="sr-only">Employees</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Employees</TooltipContent>
          </Tooltip>
          </TooltipProvider>
          )}
                    {admin && (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/configs/location"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isLocation ? "bg-accent text-black " : ""}`
                }
              >
                <FiMapPin className={`h-5 w-5  ${isLocation ? "text-black " : ""}`} />
                <span className="sr-only">Location</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Location</TooltipContent>
          </Tooltip>
          </TooltipProvider>
          )}
                              {(admin ) && (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/payrollPeriods"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isPayrollPeriods ? "bg-accent text-black " : ""}`
                }
              >
                <BsClockHistory className={`h-5 w-5  ${isPayrollPeriods ? "text-black " : ""}`} />
                <span className="sr-only">Payroll Period</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Payroll Period</TooltipContent>
          </Tooltip>
          </TooltipProvider>
          )}
          {
            (!admin && !manager) && (
              <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/employee/payroll"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isPayroll ? "bg-accent text-black " : ""}`
                }
              >
                <BsClockHistory className={`h-5 w-5  ${isPayroll ? "text-black " : ""}`} />
                <span className="sr-only">Payroll History</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Payroll History</TooltipContent>
          </Tooltip>
          </TooltipProvider>
            )
          }
          {admin && (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/managers"
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:h-8 md:w-8 transition-colors
                  ${isManager ? "bg-accent text-black " : ""}`
                }
              >
                <RiAccountPinCircleLine className={`h-5 w-5  ${isManager ? "text-black " : ""}`} />
                <span className="sr-only">Managers</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Managers</TooltipContent>
          </Tooltip>
          </TooltipProvider>
          )}
        </nav>
        {/* <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
       <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </nav> */}
      </aside>
      <div className="flex flex-col lg:gap-4 lg:py-4 lg:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:static lg:h-auto lg:border-0 lg:bg-transparent lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <MdWaves className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="lg:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <div className="flex justify-between">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground lg:text-base"
                >
                  <MdWaves className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">MQ</span>
                </Link>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <LuFileSignature className="h-5 w-5" />
                   <span>Attendance</span>
                </Link>
                {(admin || manager)   && (
                <Link
                  href="employee"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <Users2 className="h-5 w-5" />
                   <span>Employees</span>
                </Link>
                )}
                             {admin && (
                <Link
                  href="/configs/location"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <FiMapPin className="h-5 w-5" />
                   <span>Location</span>
                </Link>
                )}
                                             {(admin) && (
                <Link
                  href="/payrollPeriods"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <BsClockHistory className="h-5 w-5" />
                   <span>Payroll Period</span>
                </Link>
                )}

{(admin || manager) && (
                <Link
                  href="/managers"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                   <RiAccountPinCircleLine className="h-5 w-5" />
                   <span>Managers</span>
                </Link>
                )}

              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 lg:grow-0">

          </div>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
                onClick={() => {
                  signOut();
                }}
              >
               <CiLogout className="h-5 w-5" />
              </Button>

        </header>
        </div>
      
      </div>
    )
}

export default SideBar