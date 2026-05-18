"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import {
  UtensilsCrossed,
  FolderOpen,
  Eye,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface FeatureLimits {
  plan: string;
  isActive: boolean;
  endDate: string;
  limits: {
    menuItems: { used: number; max: number };
    categories: { used: number; max: number };
    analyticsEnabled: boolean;
    customTheme: boolean;
    prioritySupport: boolean;
  };
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: limits, isLoading: limitsLoading } = useQuery<FeatureLimits>({
    queryKey: ["feature-limits"],
    queryFn: async () => {
      const res = await api.get("/analytics/limits");
      return res.data.data;
    },
  });

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => {
      const res = await api.get("/restaurant/profile");
      return res.data.data;
    },
  });

  const stats = [
    {
      id: "stat-menu-items",
      icon: UtensilsCrossed,
      label: "Menu Items",
      value: limits?.limits.menuItems.used ?? "–",
      max: limits?.limits.menuItems.max,
      color: "text-brand-400",
      bg: "bg-brand-900/40",
      href: "/dashboard/menu",
    },
    {
      id: "stat-categories",
      icon: FolderOpen,
      label: "Categories",
      value: limits?.limits.categories.used ?? "–",
      max: limits?.limits.categories.max,
      color: "text-accent-teal",
      bg: "bg-accent-teal/10",
      href: "/dashboard/categories",
    },
    {
      id: "stat-plan",
      icon: TrendingUp,
      label: "Current Plan",
      value: limits?.plan ?? "–",
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
      href: "/dashboard/subscription",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-text-secondary text-sm">
          Here&apos;s what&apos;s happening with your menu today.
        </p>
      </div>

      {/* Subscription alert */}
      {limits && !limits.isActive && (
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">Subscription Inactive</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Your plan is not active. Please renew to continue adding menu items.
            </p>
          </div>
          <Link href="/dashboard/subscription" className="ml-auto btn-sm btn-secondary shrink-0">
            Renew
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.id}
              id={stat.id}
              href={stat.href}
              className="glass-card-hover p-6 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors" />
              </div>
              <div className="font-display text-3xl font-bold text-text-primary mb-1">
                {limitsLoading ? <span className="skeleton w-16 h-8 block" /> : stat.value}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{stat.label}</span>
                {stat.max !== undefined && (
                  <span className="text-xs text-text-muted">/{stat.max} max</span>
                )}
              </div>
              {stat.max !== undefined && (
                <div className="progress-bar mt-3">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((Number(stat.value) / stat.max) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Feature Availability */}
      {limits && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-text-primary mb-4">Plan Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Analytics", enabled: limits.limits.analyticsEnabled, href: "/dashboard/analytics" },
              { label: "Custom Themes", enabled: limits.limits.customTheme, href: "/dashboard/settings" },
              { label: "Priority Support", enabled: limits.limits.prioritySupport, href: "#" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-surface-border"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-4 h-4 ${feature.enabled ? "text-success" : "text-text-muted"}`} />
                  <span className="text-sm text-text-secondary">{feature.label}</span>
                </div>
                <span className={`badge ${feature.enabled ? "badge-success" : "badge-danger"}`}>
                  {feature.enabled ? "Active" : "Upgrade"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-text-primary mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/menu" id="quick-add-item" className="btn-primary btn-sm">
            + Add Menu Item
          </Link>
          <Link href="/dashboard/categories" id="quick-add-category" className="btn-secondary btn-sm">
            + Add Category
          </Link>
          <Link href="/dashboard/settings" id="quick-settings" className="btn-ghost btn-sm">
            Restaurant Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
