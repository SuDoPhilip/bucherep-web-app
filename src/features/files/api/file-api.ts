import api from '@/lib/api';

export const uploadFile = async (
    formData: FormData,
    onProgress?: (progressEvent: any) => void
) => {
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
    });
    return response.data;
};

export const getFiles = async () => {
    const response = await api.get('/files');
    return response.data;
};

export const deleteFile = async (fileId: string) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
};

