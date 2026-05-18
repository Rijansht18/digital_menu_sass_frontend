"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice, formatDate, getDaysUntil } from "@/lib/utils";
import { Check, AlertCircle, Clock } from "lucide-react";

export default function SubscriptionPage() {
  const qc = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await api.get("/subscription");
      return res.data.data;
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get("/subscription/packages");
      return res.data.data;
    },
  });

  const { mutate: changePlan, isPending } = useMutation({
    mutationFn: async ({ packageId, billingCycle }: any) => {
      await api.post("/subscription/change", { packageId, billingCycle });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["feature-limits"] });
    },
  });

  const daysLeft = subscription ? getDaysUntil(subscription.endDate) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Subscription</h2>
        <p className="text-text-muted text-sm mt-0.5">Manage your plan and billing</p>
      </div>

      {/* Current Status */}
      {subscription && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-text-primary mb-4">Current Plan</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-2xl font-bold text-gradient">
                  {subscription.package.name}
                </span>
                <span className={`badge ${subscription.isActive ? "badge-success" : "badge-danger"}`}>
                  {subscription.isActive ? "Active" : "Expired"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4" />
                {daysLeft > 0
                  ? `${daysLeft} days remaining (expires ${formatDate(subscription.endDate)})`
                  : "Expired"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold text-text-primary">
                {formatPrice(subscription.billingCycle === "yearly" ? subscription.package.yearlyPrice : subscription.package.monthlyPrice)}
              </div>
              <div className="text-xs text-text-muted">/{subscription.billingCycle}</div>
            </div>
          </div>
          {daysLeft <= 7 && daysLeft > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2 text-sm text-warning">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Your subscription expires in {daysLeft} days. Renew now to avoid service interruption.
            </div>
          )}
        </div>
      )}

      {/* Plan Selection */}
      <div>
        <h3 className="font-display font-bold text-text-primary mb-4">Change Plan</h3>

        <div className="flex gap-3 mb-6">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              id={`billing-${cycle}`}
              onClick={() => setBillingCycle(cycle)}
              className={`btn-sm flex-1 sm:flex-none ${billingCycle === cycle ? "btn-primary" : "btn-secondary"}`}
            >
              {cycle === "yearly" ? "Yearly (Save 17%)" : "Monthly"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg: any) => {
            const isCurrentPlan = subscription?.package?.id === pkg.id;
            const price = billingCycle === "yearly" ? pkg.yearlyPrice : pkg.monthlyPrice;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-6 border transition-all duration-200 ${
                  isCurrentPlan
                    ? "border-brand-600 bg-brand-900/40"
                    : "glass-card hover:border-brand-600/40"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="px-3 py-0.5 rounded-full bg-gradient-brand text-white text-xs font-bold">
                      Current Plan
                    </span>
                  </div>
                )}

                <h4 className="font-display font-bold text-text-primary text-lg mb-1">{pkg.name}</h4>
                <p className="text-text-muted text-xs mb-4">{pkg.description}</p>

                <div className="font-display text-3xl font-bold text-text-primary mb-1">
                  {formatPrice(price)}
                </div>
                <div className="text-xs text-text-muted mb-4">/{billingCycle}</div>

                <ul className="space-y-2 mb-5 text-sm text-text-secondary">
                  {[
                    `${pkg.maxMenuItems} menu items`,
                    `${pkg.maxCategories} categories`,
                    pkg.analyticsEnabled ? "Analytics included" : "No analytics",
                    pkg.customTheme ? "Custom themes" : null,
                    pkg.prioritySupport ? "Priority support" : null,
                  ].filter(Boolean).map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  id={`select-plan-${pkg.name.toLowerCase()}`}
                  disabled={isCurrentPlan || isPending}
                  onClick={() => changePlan({ packageId: pkg.id, billingCycle })}
                  className={isCurrentPlan ? "btn-secondary w-full justify-center opacity-50 cursor-not-allowed" : "btn-primary w-full justify-center"}
                >
                  {isCurrentPlan ? "Current Plan" : isPending ? "Updating…" : "Switch to this Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
