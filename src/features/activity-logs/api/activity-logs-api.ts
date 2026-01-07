import api from '@/lib/api';

export interface ActivityLog {
    id: number;
    action: 'create' | 'update' | 'delete';
    entityType: string;
    entityId: number | null;
    description: string;
    metadata: Record<string, any> | null;
    createdAt: string;
    user: {
        id: number;
        email: string;
        fullName: string | null;
    };
}

export interface ActivityLogsResponse {
    logs: ActivityLog[];
    meta: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
    };
}

export const getActivityLogs = async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity_type?: string;
}): Promise<ActivityLogsResponse> => {
    const response = await api.get<ActivityLogsResponse>('/activity-logs', { params });
    return response.data;
};

