import { NavLink } from "react-router-dom";
import { 
    Menu,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
    { name: "File Upload", href: "/", icon: Upload },
    // { name: "Activity Logs", href: "/activity-logs", icon: Activity },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "border-r bg-white dark:bg-gray-900 transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between px-4 border-b">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Menu
                        </h2>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="ml-auto"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                                        isCollapsed && "justify-center"
                                    )
                                }
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span>{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

