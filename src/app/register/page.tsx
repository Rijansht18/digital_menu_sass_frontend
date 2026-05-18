"use client";

import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Menu, Check } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  adminName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  packageId: z.string().min(1, "Please select a plan"),
  billingCycle: z.enum(["monthly", "yearly"]).optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const defaultPlan = searchParams.get("plan");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { billingCycle: "monthly" },
  });

  const selectedPackageId = watch("packageId");
  const billingCycle = watch("billingCycle");

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get("/subscription/packages");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (defaultPlan && packages.length > 0) {
      const matched = packages.find((p: any) => p.name.toLowerCase() === defaultPlan.toLowerCase());
      if (matched) {
        setValue("packageId", matched.id);
      }
    } else if (packages.length > 0 && !selectedPackageId) {
      setValue("packageId", packages[0].id);
    }
  }, [defaultPlan, packages, setValue, selectedPackageId]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await api.post("/auth/register", data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      setError("root", {
        message: error.response?.data?.message || "Registration failed. Please try again.",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-surface-elevated">
              <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">RestroSphere</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Create your account
          </h1>
          <p className="text-text-secondary text-sm">Start with a 14-day free trial. No credit card required.</p>
        </div>

        <div className="glass-card p-8">
          {errors.root && (
            <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => mutate(d))} id="register-form" className="space-y-6">
            {/* Step 1: Choose Plan */}
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-brand text-white text-xs flex items-center justify-center font-bold">1</span>
                Choose a Plan
              </h2>

              <div className="flex gap-3 mb-4">
                {(["monthly", "yearly"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setValue("billingCycle", cycle)}
                    className={`btn-sm flex-1 ${billingCycle === cycle ? "btn-primary" : "btn-secondary"}`}
                  >
                    {cycle === "yearly" ? "Yearly (Save 17%)" : "Monthly"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg: any) => (
                  <button
                    key={pkg.id}
                    type="button"
                    id={`plan-${pkg.name.toLowerCase()}`}
                    onClick={() => setValue("packageId", pkg.id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                      selectedPackageId === pkg.id
                        ? "border-brand-600 bg-brand-900/40 shadow-glow"
                        : "border-surface-border bg-surface-elevated hover:border-brand-600/40"
                    }`}
                  >
                    {selectedPackageId === pkg.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="font-display font-bold text-text-primary mb-1">{pkg.name}</div>
                    <div className="font-bold text-brand-400 text-lg">
                      ${billingCycle === "yearly" ? pkg.yearlyPrice : pkg.monthlyPrice}
                      <span className="text-xs text-text-muted font-normal">/{billingCycle === "yearly" ? "yr" : "mo"}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">{pkg.maxMenuItems} items · {pkg.maxCategories} categories</div>
                  </button>
                ))}
              </div>
              {errors.packageId && <p className="error-text mt-1">{errors.packageId.message}</p>}
            </div>

            {/* Step 2: Restaurant Info */}
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-brand text-white text-xs flex items-center justify-center font-bold">2</span>
                Restaurant Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="restaurantName" className="label">Restaurant Name</label>
                  <input id="restaurantName" type="text" placeholder="Hotel ABC" className={`input ${errors.restaurantName ? "input-error" : ""}`} {...register("restaurantName")} />
                  {errors.restaurantName && <p className="error-text">{errors.restaurantName.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone (optional)</label>
                  <input id="phone" type="tel" placeholder="+977 98XXXXXXXX" className="input" {...register("phone")} />
                </div>
                <div>
                  <label htmlFor="address" className="label">Address (optional)</label>
                  <input id="address" type="text" placeholder="Thamel, Kathmandu" className="input" {...register("address")} />
                </div>
              </div>
            </div>

            {/* Step 3: Admin Account */}
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-brand text-white text-xs flex items-center justify-center font-bold">3</span>
                Admin Account
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminName" className="label">Your Name</label>
                  <input id="adminName" type="text" placeholder="John Doe" className={`input ${errors.adminName ? "input-error" : ""}`} {...register("adminName")} />
                  {errors.adminName && <p className="error-text">{errors.adminName.message}</p>}
                </div>
                <div>
                  <label htmlFor="reg-email" className="label">Email</label>
                  <input id="reg-email" type="email" placeholder="you@restaurant.com" className={`input ${errors.email ? "input-error" : ""}`} {...register("email")} />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="reg-password" className="label">Password</label>
                  <input id="reg-password" type="password" placeholder="At least 8 characters" className={`input ${errors.password ? "input-error" : ""}`} {...register("password")} />
                  {errors.password && <p className="error-text">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <button type="submit" id="register-submit" disabled={isPending} className="btn-primary w-full justify-center">
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : "Create Account & Start Free Trial"}
            </button>

            <p className="text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
