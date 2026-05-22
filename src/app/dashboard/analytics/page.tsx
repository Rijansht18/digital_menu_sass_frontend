"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { BarChart3, Eye, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await api.get("/analytics?days=30");
      return res.data.data;
    },
    retry: false,
  });

  // Feature gate — show upgrade prompt if analytics not available (403)
  if (error) {
    if ((error as any).response?.status === 403) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-900/60 border border-brand-700/30 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-3">Analytics Locked</h2>
          <p className="text-text-secondary mb-6 max-w-sm">
            Analytics is not available on your current plan. Upgrade to Growth or Pro to access detailed insights.
          </p>
          <Link href="/dashboard/subscription" className="btn-primary">
            Upgrade Plan
          </Link>
        </div>
      );
    }
    return (
      <div className="p-12 text-center text-danger">
        Error loading analytics: {(error as any).message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Analytics</h2>
        <p className="text-text-muted text-sm mt-0.5">Last 30 days overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total Views", value: data?.totalViews ?? "–", icon: Eye, color: "text-brand-400", bg: "bg-brand-400/40" },
          { label: "Menu Version", value: data?.featureLimits?.limits ? "Active" : "–", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Top Items", value: data?.topItems?.length ?? "–", icon: BarChart3, color: "text-accent-orange", bg: "bg-accent-orange/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-6">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-display text-3xl font-bold text-text-primary mb-1">
                {isLoading ? <span className="skeleton w-16 h-8 block" /> : stat.value}
              </div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Top Items */}
      {data?.topItems?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-text-primary mb-4">Most Viewed Items</h3>
          <div className="space-y-3">
            {data.topItems.map((item: any, idx: number) => (
              <div key={item.itemId} className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gradient-brand text-white text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-text-secondary">{item.itemId}</span>
                </div>
                <span className="badge-brand">{item._count?.itemId} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
