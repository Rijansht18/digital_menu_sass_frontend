"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Menu, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await api.post("/auth/login", data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      if (data.user.role === "SUPER_ADMIN") {
        router.push("/superadmin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      setError("root", {
        message: error.response?.data?.message || "Login failed. Please try again.",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-surface-elevated">
              <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">RestroSphere</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to manage your restaurant menu</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          {errors.root && (
            <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5" id="login-form">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@restaurant.com"
                className={`input ${errors.email ? "input-error" : ""}`}
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                  {...register("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isPending}
              className="btn-primary w-full justify-center mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
