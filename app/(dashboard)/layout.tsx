import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SideBar from "../components/sidebar";
import { Toaster } from "@/components/ui/toaster"
import getCurrentUser from "../actions/getCurrentUser";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Employee Management"
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-muted/40">
          <SideBar admin={user?.isAdmin} manager={user?.isManager} />
          <div className="flex flex-col md:gap-4 ">
            {children}
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
