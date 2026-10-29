"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema } from "@/schemas/auth";
import { LoginFormData } from "@/types/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

/**
 * LoginForm Component
 * 
 * Handles user authentication via email and password.
 * This form is a key part of the app’s user access flow, allowing
 * registered users to log in and access protected poll management routes.
 * 
 * What it does:
 * - Validates input using Zod schema (email format, password rules).
 * - Manages form state with react-hook-form for error handling and UX.
 * - Integrates with AuthContext `signIn` method to perform Supabase login.
 * - Handles loading states and displays inline & root-level error messages.
 * - Redirects user to `/polls` dashboard upon successful login.
 * 
 * Why it exists:
 * - Protects poll creation and voting functionalities behind authentication.
 * - Ensures UX feedback for invalid inputs or backend errors.
 * 
 * Assumptions:
 * - User exists in Supabase with valid credentials.
 * - AuthContext is properly initialized and provides signIn and user.
 * - Router is available via Next.js App Router.
 * 
 * Edge Cases Handled:
 * - Supabase errors (invalid credentials, network issues) are surfaced.
 * - Input errors are cleared on re-submission to prevent stale messages.
 * - Password visibility toggle provides accessibility for users.
 * 
 * Connected Components/Files:
 * - `lib/AuthContext.tsx` provides the signIn function and user state.
 * - `schemas/auth.ts` defines validation rules for login fields.
 * - `types/auth.ts` defines TypeScript types for login data.
 * - UI components (`Button`, `Input`, `Label`, `Alert`) standardize styling.
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Setup react-hook-form with Zod validation schema
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // Schema-based validation
    mode: "onBlur", // Validate on field blur
  });

  /**
   * onSubmit - Handles login form submission
   * 
   * @param data - LoginFormData containing email and password
   * 
   * Flow:
   * 1. Set loading state to true.
   * 2. Attempt to sign in via AuthContext.
   * 3. If an error occurs, display it using react-hook-form's setError.
   * 4. On success, redirect user to /polls dashboard.
   * 5. Always clear loading state in finally block.
   * 
   * Edge Cases:
   * - Unexpected errors are displayed as a generic message to the user.
   * - Supports Supabase returning either an Error object or string message.
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { email, password } = data;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, password
        }),
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response?.message ?? "Login failed");
      toast.success("Login successful!");
      const redirectUrl = searchParams.get("redirectedFrom") || "/dashboard";
      router.push(redirectUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          {...register("email")}
          className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register("password")}
            className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
      
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full bg-gradient-to-tr from-blue-900 to-purple-800 border-purple-200 font-semibold py-5 mt-6" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}