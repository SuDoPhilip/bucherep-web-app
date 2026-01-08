import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Trash2, Plus, RefreshCw, Loader2 } from "lucide-react";
import { getActivityLogs, type ActivityLog } from "@/features/activity-logs/api/activity-logs-api";

const actionIcons = {
    create: Plus,
    update: RefreshCw,
    delete: Trash2,
};

const actionColors = {
    create: "text-green-600 dark:text-green-400",
    update: "text-blue-600 dark:text-blue-400",
    delete: "text-red-600 dark:text-red-400",
};

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({
        total: 0,
        perPage: 20,
        currentPage: 1,
        lastPage: 1,
    });
    const [filter, setFilter] = useState<{
        action?: string;
        entity_type?: string;
    }>({});

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await getActivityLogs({
                page,
                limit: 20,
                ...filter,
            });
            setLogs(response.logs);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch activity logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, filter]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            
            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            
            return date.toLocaleDateString();
        } catch {
            return new Date(dateString).toLocaleString();
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Activity Logs
                        </h1>
                        <p className="text-muted-foreground">
                            Track all user activities and changes
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter activity logs by action or entity type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <select
                                className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900"
                                value={filter.action || ""}
                                onChange={(e) =>
                                    setFilter({ ...filter, action: e.target.value || undefined })
                                }
                            >
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                            </select>
                            <select
                                className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900"
                                value={filter.entity_type || ""}
                                onChange={(e) =>
                                    setFilter({ ...filter, entity_type: e.target.value || undefined })
                                }
                            >
                                <option value="">All Entities</option>
                                <option value="file">Files</option>
                            </select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFilter({});
                                    setPage(1);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity History</CardTitle>
                        <CardDescription>
                            {meta.total} total activities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No activity logs found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log) => {
                                    const ActionIcon = actionIcons[log.action];
                                    const actionColor = actionColors[log.action];

                                    return (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className={`flex-shrink-0 ${actionColor}`}>
                                                <ActionIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {log.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="capitalize">{log.action}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{log.entityType}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(log.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!isLoading && logs.length > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Page {meta.currentPage} of {meta.lastPage}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                                        disabled={page === meta.lastPage}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

