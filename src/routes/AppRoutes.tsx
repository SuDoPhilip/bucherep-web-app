import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SetPasswordPage from "@/pages/auth/SetPasswordPage";
import FileUploadPage from "@/pages/FileUploadPage";
import HomePage from "@/pages/HomePage";
import ActivityLogsPage from "@/pages/ActivityLogsPage";
import RequireAuth from "@/features/auth/components/RequireAuth";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/set-password" element={<SetPasswordPage />} />
            </Route>
            <Route path="/" element={
                <RequireAuth>
                    <FileUploadPage />
                </RequireAuth>
            } />
            <Route path="/dashboard" element={
                <RequireAuth>
                    <HomePage />
                </RequireAuth>
            } />
            <Route path="/activity-logs" element={
                <RequireAuth>
                    <ActivityLogsPage />
                </RequireAuth>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
