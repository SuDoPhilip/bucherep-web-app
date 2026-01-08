import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

