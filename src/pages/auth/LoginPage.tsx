import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { login } from "@/features/auth/api/auth-api";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login: setUser } = useAuth();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (data: LoginFormValues) => {
        setApiError(null);
        setIsLoading(true);

        try {
            const user = await login(data);
            setUser(user);
            
            // Navigate to the page they were trying to access, or home
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
            navigate(from, { replace: true });
        } catch (err: any) {
            // Handle different types of errors
            let errorMessage = "Invalid email or password. Please try again.";
            
            if (err.response) {
                // API returned an error response
                const status = err.response.status;
                const message = err.response.data?.message;
                
                if (status === 401 || status === 403) {
                    errorMessage = message || "Invalid email or password. Please check your credentials and try again.";
                } else if (status === 422) {
                    // Validation errors from backend
                    const errors = err.response.data?.errors;
                    if (errors) {
                        // Set field-specific errors if available
                        Object.keys(errors).forEach((field) => {
                            const fieldError = errors[field];
                            if (Array.isArray(fieldError) && fieldError.length > 0) {
                                form.setError(field as keyof LoginFormValues, {
                                    type: "server",
                                    message: fieldError[0],
                                });
                            }
                        });
                        errorMessage = "Please correct the errors above.";
                    } else {
                        errorMessage = message || errorMessage;
                    }
                } else if (status >= 500) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    errorMessage = message || errorMessage;
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = "Unable to connect to the server. Please check your connection and try again.";
            } else {
                // Something else happened
                errorMessage = err.message || errorMessage;
            }
            
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">Welcome Back</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access your workspace</p>
            </div>

            {apiError && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    {apiError}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="name@example.com"
                                            className="pl-10"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm font-normal text-gray-600 dark:text-gray-300 cursor-pointer">Remember me for 30 days</label>
                </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
