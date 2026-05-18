"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { 
  Building2, 
  Menu as MenuIcon, 
  Eye, 
  TrendingUp, 
  Package, 
  CheckCircle,
  Loader2 
} from "lucide-react";

export default function SuperadminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: async () => {
      const res = await api.get("/superadmin/analytics");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Restaurants",
      value: analytics?.totalRestaurants || 0,
      icon: Building2,
      description: `${analytics?.activeRestaurants || 0} active on the platform`,
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Active Subscriptions",
      value: analytics?.activeRestaurants || 0,
      icon: CheckCircle,
      description: "Paying customers",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      title: "Total Menu Items",
      value: analytics?.totalMenuItems || 0,
      icon: MenuIcon,
      description: "Across all registered restaurants",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      title: "Total Menu Views",
      value: analytics?.totalViews || 0,
      icon: Eye,
      description: "Lifetime traffic generated",
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Platform Analytics</h2>
        <p className="text-text-muted text-sm mt-0.5">Global metrics and performance overview</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-brand-500/30 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-bl-full opacity-40 blur-lg -z-10 group-hover:scale-125 transition-transform duration-300`} />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-text-secondary">{stat.title}</span>
                  <div className={`p-2 rounded-xl bg-surface-elevated border border-surface-border ${stat.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="font-display text-3xl font-bold text-text-primary">
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-text-muted mt-4 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-400" />
            Subscription Packages Breakdown
          </h3>

          <div className="space-y-5">
            {analytics?.packageStats?.map((pkg: any) => {
              const activeCount = pkg._count?.subscriptions || 0;
              const totalSubs = analytics?.packageStats?.reduce((sum: number, p: any) => sum + (p._count?.subscriptions || 0), 0) || 1;
              const percentage = Math.round((activeCount / totalSubs) * 100) || 0;

              return (
                <div key={pkg.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-text-primary">{pkg.name}</span>
                    <span className="text-text-secondary">
                      {activeCount} ({percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            
            {(!analytics?.packageStats || analytics.packageStats.length === 0) && (
              <div className="text-center py-8 text-text-muted text-sm">
                No subscription data available
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            Active Subscriptions
          </h3>
          <div className="flex flex-col items-center justify-center h-48 relative">
            <div className="text-center">
              <span className="text-5xl font-bold font-display text-gradient">
                {analytics?.activeRestaurants || 0}
              </span>
              <p className="text-sm text-text-muted mt-2">Active Paid Subscriptions</p>
            </div>
            <div className="absolute inset-0 bg-gradient-radial from-brand-500/10 to-transparent blur-xl pointer-events-none -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
