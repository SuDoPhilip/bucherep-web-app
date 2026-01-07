import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xl">
                <div className="relative z-10 p-8">
                    <Outlet />
                </div>
            </div>

            <div className="absolute bottom-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Triseed. All rights reserved.
            </div>
        </div>
    );
}
