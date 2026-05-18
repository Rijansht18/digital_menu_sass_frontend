"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Building2, UtensilsCrossed, Eye, Package } from "lucide-react";

export default function SuperadminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async () => {
      const res = await api.get("/superadmin/analytics");
      return res.data.data;
    },
  });

  const stats = [
    { label: "Total Restaurants", value: data?.totalRestaurants, icon: Building2, color: "text-brand-400", bg: "bg-brand-900/40" },
    { label: "Active Restaurants", value: data?.activeRestaurants, icon: Building2, color: "text-success", bg: "bg-success/10" },
    { label: "Total Menu Items", value: data?.totalMenuItems, icon: UtensilsCrossed, color: "text-accent-orange", bg: "bg-accent-orange/10" },
    { label: "Total Views", value: data?.totalViews, icon: Eye, color: "text-accent-teal", bg: "bg-accent-teal/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Platform Overview</h2>
        <p className="text-text-muted text-sm mt-0.5">Key metrics across all restaurants</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-6">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-display text-3xl font-bold text-text-primary mb-1">
                {isLoading ? <span className="skeleton w-12 h-8 block" /> : (stat.value ?? "–")}
              </div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Package Stats */}
      {data?.packageStats && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-400" />
            Subscriptions by Package
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.packageStats.map((pkg: any) => (
              <div key={pkg.id} className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                <div className="font-display font-bold text-text-primary mb-1">{pkg.name}</div>
                <div className="font-display text-2xl font-bold text-gradient">{pkg._count?.subscriptions}</div>
                <div className="text-xs text-text-muted">active subscriptions</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
