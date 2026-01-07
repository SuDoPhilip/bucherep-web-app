import { useState, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/features/files/api/file-api";

interface UploadedFile {
    file: File;
    id: string;
    status: "uploading" | "success" | "error";
    progress: number;
    error?: string;
}

export default function FileUploadPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const isValidFileType = (file: File): boolean => {
        const allowedExtensions = ['.pdf', '.xls', '.xlsx'];
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(fileExtension) || allowedMimeTypes.includes(file.type);
    };

    const handleFileSelect = useCallback((fileList: FileList | null) => {
        if (!fileList) return;

        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        Array.from(fileList).forEach((file) => {
            if (isValidFileType(file)) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        // Show error for invalid files
        if (invalidFiles.length > 0) {
            alert(`The following files are not supported. Only PDF and Excel files are allowed:\n${invalidFiles.join('\n')}`);
        }

        if (validFiles.length === 0) return;

        // Add to selected files queue (don't upload yet)
        setSelectedFiles((prev) => [...prev, ...validFiles]);
    }, []);

    const uploadFileItem = async (fileItem: UploadedFile) => {
        try {
            const formData = new FormData();
            formData.append("file", fileItem.file);

            await uploadFile(formData, (progressEvent) => {
                const progress = progressEvent.total
                    ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    : 0;

                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileItem.id ? { ...f, progress } : f
                    )
                );
            });

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id
                        ? { ...f, status: "success" as const, progress: 100 }
                        : f
                )
            );
        } catch (error: any) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id
                        ? {
                              ...f,
                              status: "error" as const,
                              error: error.response?.data?.message || error.message || "Upload failed",
                          }
                        : f
                )
            );
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect]
    );

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);

        // Convert selected files to upload queue
        const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: "uploading" as const,
            progress: 0,
        }));

        setFiles((prev) => [...prev, ...newFiles]);
        setSelectedFiles([]); // Clear selected files

        // Upload each file
        await Promise.all(newFiles.map((fileItem) => uploadFileItem(fileItem)));

        setIsUploading(false);
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setFiles([]);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        File Upload
                    </h1>
                    <p className="text-muted-foreground">
                        Upload and manage your files
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Files</CardTitle>
                        <CardDescription>
                            Select multiple files and upload them all at once
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                                isDragging
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload
                                className={cn(
                                    "mx-auto h-12 w-12 mb-4",
                                    isDragging
                                        ? "text-orange-500"
                                        : "text-gray-400"
                                )}
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Drag and drop files here, or click to select files
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                Supported formats: PDF (.pdf), Excel (.xls, .xlsx)
                            </p>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={(e) => {
                                    handleFileSelect(e.target.files);
                                    e.target.value = ''; // Reset input to allow selecting same files again
                                }}
                            />
                            <Button
                                type="button"
                                onClick={() =>
                                    document.getElementById("file-upload")?.click()
                                }
                                variant="outline"
                                className="mb-4"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Select Files
                            </Button>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Selected Files ({selectedFiles.length})
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAll}
                                        className="text-xs"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative group p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <File className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate w-full mb-1">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSelectedFile(index)}
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={isUploading || selectedFiles.length === 0}
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {files.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Files</CardTitle>
                            <CardDescription>
                                {files.filter((f) => f.status === "success").length} of{" "}
                                {files.length} files uploaded successfully
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {files.map((fileItem) => (
                                    <div
                                        key={fileItem.id}
                                        className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900"
                                    >
                                        <div className="flex-shrink-0">
                                            <File className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {fileItem.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(fileItem.file.size)}
                                            </p>
                                            {fileItem.status === "uploading" && (
                                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${fileItem.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {fileItem.status === "error" && fileItem.error && (
                                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                    {fileItem.error}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {fileItem.status === "uploading" && (
                                                <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                                            )}
                                            {fileItem.status === "success" && (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            )}
                                            {fileItem.status === "error" && (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFile(fileItem.id)}
                                                className="h-8 w-8"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

