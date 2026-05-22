"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatPrice, formatDate, getDaysUntil } from "@/lib/utils";
import { Check, AlertCircle, Clock, Crown, Sparkles, X, Mail, Phone, MessageCircle } from "lucide-react";

function ChangePlanDialog({
  open,
  onClose,
  plan,
  billingCycle,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  plan: any;
  billingCycle: "monthly" | "yearly";
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-surface rounded-2xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-surface-border">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-text-primary">
                Switch to {plan.name} Plan
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-600">
                      Plan Change Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-600/80">
                      To change your subscription plan, please contact our support team. 
                      We'll help you find the best plan for your restaurant needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-surface-elevated/40 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-text-secondary">Selected Plan:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-text-primary">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-text-secondary">Billing Cycle:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-text-primary capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-text-secondary">Price:</span>
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{formatPrice(price)}/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
              </div>

              {/* <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-text-secondary text-center">
                  Contact our support team to proceed with the plan change:
                </p>
                <div className="flex flex-col gap-2">
                  <a 
                    href="mailto:support@restrosphere.com" 
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-surface-elevated dark:hover:bg-surface-card text-gray-700 dark:text-text-secondary transition-all duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    support@restrosphere.com
                  </a>
                  <a 
                    href="tel:+1234567890" 
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-surface-elevated dark:hover:bg-surface-card text-gray-700 dark:text-text-secondary transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    +1 (234) 567-890
                  </a>
                  <button 
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-400 transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>
                </div>
              </div> */}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-surface/80 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Processing..." : "Contact Support"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const qc = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

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

  //  const { mutate: changePlan, isPending } = useMutation({
  //   mutationFn: async ({ packageId, billingCycle }: any) => {
  //     await api.post("/subscription/change", { packageId, billingCycle });
  //   },
  //   onSuccess: () => {
  //     qc.invalidateQueries({ queryKey: ["subscription"] });
  //     qc.invalidateQueries({ queryKey: ["feature-limits"] });
  //   },
  // });

  const { mutate: changePlan, isPending } = useMutation({
    mutationFn: async ({ packageId, billingCycle }: any) => {
      // For now, just simulate API call without actually updating
      // In next phase, this will be replaced with actual payment integration
      console.log("Plan change requested:", { packageId, billingCycle });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Don't actually call the API yet
      // return await api.post("/subscription/change", { packageId, billingCycle });
      
      return { success: true };
    },
    onSuccess: () => {
      // Don't invalidate queries for now since we're not actually updating
      // qc.invalidateQueries({ queryKey: ["subscription"] });
      // qc.invalidateQueries({ queryKey: ["feature-limits"] });
      setShowDialog(false);
      setSelectedPlan(null);
    },
  });

  const handlePlanSelect = (pkg: any) => {
    setSelectedPlan(pkg);
    setShowDialog(true);
  };

  const handleConfirmChange = () => {
    if (selectedPlan) {
      changePlan({ packageId: selectedPlan.id, billingCycle });
    }
  };

  const daysLeft = subscription ? getDaysUntil(subscription.endDate) : 0;
  const currentPackage = subscription?.package;
  const availablePackages = packages.filter((pkg: any) => pkg.id !== currentPackage?.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">
          Subscription
        </h2>
        <p className="text-gray-500 dark:text-text-muted text-sm mt-0.5">
          Manage your plan and billing
        </p>
      </div>

      {/* Current Plan Section */}
      {subscription && (
        <div className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-surface-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-surface-border bg-gradient-to-r from-brand-50 to-transparent dark:from-brand-500/5">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-display font-bold text-gray-900 dark:text-text-primary">
                Current Plan
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">
                    {subscription.package.name}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.isActive 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {subscription.isActive ? "Active" : "Expired"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-text-muted">
                  <Clock className="w-4 h-4" />
                  {daysLeft > 0
                    ? `${daysLeft} days remaining (expires ${formatDate(subscription.endDate)})`
                    : "Expired"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-bold text-gray-900 dark:text-text-primary">
                  {formatPrice(subscription.billingCycle === "yearly" ? subscription.package.yearlyPrice : subscription.package.monthlyPrice)}
                </div>
                <div className="text-xs text-gray-500 dark:text-text-muted capitalize">/{subscription.billingCycle}</div>
              </div>
            </div>
            
            {daysLeft <= 7 && daysLeft > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Your subscription expires in {daysLeft} days. Contact support to renew.
              </div>
            )}

            {/* Current Plan Features */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-surface-border">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-text-secondary mb-3">
                Plan Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  `${subscription.package.maxMenuItems} menu items`,
                  `${subscription.package.maxCategories} categories`,
                  subscription.package.analyticsEnabled ? "Analytics included" : "No analytics",
                  subscription.package.customTheme ? "Custom themes" : null,
                  subscription.package.prioritySupport ? "Priority support" : null,
                ].filter(Boolean).map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="font-display font-bold text-gray-900 dark:text-text-primary">
            Available Plans
          </h3>
        </div>

        <div className="flex gap-3 mb-6">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              id={`billing-${cycle}`}
              onClick={() => setBillingCycle(cycle)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === cycle 
                  ? "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
              }`}
            >
              {cycle === "yearly" ? "Yearly (Save 17%)" : "Monthly"}
            </button>
          ))}
        </div>

        {availablePackages.length === 0 ? (
          <div className="bg-gray-50 dark:bg-surface-elevated/20 rounded-2xl border border-gray-200 dark:border-surface-border p-12 text-center">
            <p className="text-gray-500 dark:text-text-muted">
              You're on the best plan available!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePackages.map((pkg: any) => {
              const price = billingCycle === "yearly" ? pkg.yearlyPrice : pkg.monthlyPrice;
              const isCurrentPlan = subscription?.package?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-surface-border p-6 hover:shadow-lg transition-all duration-200 hover:border-brand-200 dark:hover:border-brand-800 flex flex-col"
                >
                  <h4 className="font-display font-bold text-gray-900 dark:text-text-primary text-lg mb-1">
                    {pkg.name}
                  </h4>
                  <p className="text-gray-500 dark:text-text-muted text-xs mb-4">
                    {pkg.description || "Perfect for your restaurant"}
                  </p>

                  <div className="mb-4">
                    <div className="font-display text-3xl font-bold text-gray-900 dark:text-text-primary">
                      {formatPrice(price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-text-muted capitalize">/{billingCycle}</div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      `${pkg.maxMenuItems} menu items`,
                      `${pkg.maxCategories} categories`,
                      pkg.analyticsEnabled ? "Analytics included" : "No analytics",
                      pkg.customTheme ? "Custom themes" : null,
                      pkg.prioritySupport ? "Priority support" : null,
                    ].filter(Boolean).map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 shrink-0 ${
                          feature.includes("No") 
                            ? "text-gray-400 dark:text-gray-600" 
                            : "text-green-600 dark:text-green-400"
                        }`} />
                        <span className={`text-sm ${
                          feature.includes("No") 
                            ? "text-gray-400 dark:text-gray-600" 
                            : "text-gray-700 dark:text-text-secondary"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    id={`select-plan-${pkg.name.toLowerCase().replace(/\s/g, '-')}`}
                    disabled={isCurrentPlan}
                    onClick={() => handlePlanSelect(pkg)}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Switch to this Plan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Plan Dialog */}
      {selectedPlan && (
        <ChangePlanDialog
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onConfirm={handleConfirmChange}
          isPending={isPending}
        />
      )}
    </div>
  );
}