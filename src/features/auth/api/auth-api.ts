import api from '@/lib/api';
import type { User } from '@/types/auth';

export const login = async (credentials: any) => {
    const response = await api.post<{ user: User }>('/auth/login', credentials);
    return response.data.user;
};

export const logout = async () => {
    await api.post('/auth/logout');
};

export const getMe = async () => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
};
