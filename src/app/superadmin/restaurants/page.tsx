"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Search, ShieldOff, ShieldCheck, X, Building2, Calendar, CreditCard, User, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

function RestaurantDetailsModal({ open, onClose, restaurant }: { open: boolean, onClose: () => void, restaurant: any }) {
  if (!open || !restaurant) return null;

  const owner = restaurant.users?.[0];
  const sub = restaurant.subscription;
  const pkg = sub?.package;
  const isYearly = sub?.billingCycle === "yearly";
  const price = Number(pkg ? (isYearly ? pkg.yearlyPrice : pkg.monthlyPrice) : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 dark:bg-surface/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-surface rounded-2xl shadow-2xl p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              Restaurant Details
            </h3>
            <button onClick={onClose} className="btn-icon btn-ghost">
              <X className="w-5 h-5 text-gray-500 dark:text-text-muted" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Column 1: Info & Owner */}
            <div className="space-y-6">
              <div>
                <div className="text-xs text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider font-semibold">General Info</div>
                <div className="space-y-1 bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border/60 p-4 rounded-xl">
                  <div className="font-semibold text-gray-900 dark:text-text-primary text-base">{restaurant.name}</div>
                  <div className="text-sm text-brand-600 dark:text-brand-400 font-mono">/{restaurant.slug}</div>
                  <div className="text-[10px] text-gray-400 dark:text-text-muted font-mono mt-1 select-all bg-gray-100 dark:bg-surface-card border border-gray-200 dark:border-surface-border/50 px-1.5 py-0.5 rounded w-max">ID: {restaurant.id}</div>
                  {restaurant.phone && <div className="text-xs text-gray-600 dark:text-text-secondary mt-2">📞 {restaurant.phone}</div>}
                  {restaurant.address && <div className="text-xs text-gray-600 dark:text-text-secondary">📍 {restaurant.address}</div>}
                </div>
              </div>

              {owner && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Account Owner
                  </div>
                  <div className="bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border/60 p-4 rounded-xl space-y-2">
                    <div className="font-medium text-gray-900 dark:text-text-primary text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-500 dark:text-text-muted" /> {owner.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-text-secondary flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-text-muted" /> {owner.email}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Registration Details
                </div>
                <div className="bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border/60 p-4 rounded-xl text-xs space-y-1">
                  <div className="text-gray-700 dark:text-text-primary">
                    Registered on <strong>{new Date(restaurant.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</strong>
                  </div>
                  <div className="text-gray-500 dark:text-text-muted">
                    Time: {new Date(restaurant.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Subscription & Usage */}
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800/30">
                <div className="text-xs text-gray-600 dark:text-text-muted mb-3 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Subscription Plan
                </div>
                {sub ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-bold text-brand-700 dark:text-gradient text-lg">{pkg?.name} Plan</span>
                      <span className={`badge ${sub.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {sub.isActive ? "Active" : "Expired"}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-surface-border/40 my-2 pt-2 text-xs space-y-1.5">
                      <div className="flex justify-between text-gray-700 dark:text-text-primary">
                        <span>Billing Cycle:</span>
                        <span className="font-bold capitalize">{sub.billingCycle}</span>
                      </div>
                      <div className="flex justify-between text-gray-700 dark:text-text-primary">
                        <span>Plan Price:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          Rs. {price.toFixed(2)} / {isYearly ? "year" : "month"}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-text-muted">
                        <span>Start Date:</span>
                        <span>{formatDate(sub.startDate)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-text-muted">
                        <span>Renewal Date:</span>
                        <span>{formatDate(sub.endDate)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-text-muted py-2">No active subscription</div>
                )}
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-text-muted mb-2 uppercase tracking-wider font-semibold">Usage & Limits</div>
                <div className="space-y-3 bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border/60 p-4 rounded-xl text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-gray-600 dark:text-text-secondary">
                      <span>Menu Items</span>
                      <span className="font-medium text-gray-900 dark:text-text-primary">{restaurant._count?.menuItems || 0} / {pkg?.maxMenuItems ?? "∞"}</span>
                    </div>
                    {pkg?.maxMenuItems && (
                      <div className="w-full bg-gray-200 dark:bg-surface h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((restaurant._count?.menuItems || 0) / pkg.maxMenuItems) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-gray-600 dark:text-text-secondary">
                      <span>Categories</span>
                      <span className="font-medium text-gray-900 dark:text-text-primary">{restaurant._count?.categories || 0} / {pkg?.maxCategories ?? "∞"}</span>
                    </div>
                    {pkg?.maxCategories && (
                      <div className="w-full bg-gray-200 dark:bg-surface h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((restaurant._count?.categories || 0) / pkg.maxCategories) * 100)}` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminRestaurantsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-restaurants", search],
    queryFn: async () => {
      const res = await api.get("/superadmin/restaurants", {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  const restaurants = data?.restaurants || [];

  const { mutate: toggleSuspend } = useMutation({
    mutationFn: async (id: string) => api.patch(`/superadmin/restaurants/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-restaurants"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">Restaurants</h2>
          <p className="text-gray-500 dark:text-text-muted text-sm mt-0.5">{data?.pagination?.total ?? 0} total restaurants</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-text-muted" />
          <input
            id="sa-restaurant-search"
            type="search"
            placeholder="Search restaurants..."
            className="input pl-10 sm:w-72 bg-white dark:bg-surface border-gray-200 dark:border-surface-border text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-surface-elevated border-b border-gray-200 dark:border-surface-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="skeleton h-5 w-full bg-gray-200 dark:bg-surface-elevated rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-text-muted">
                  No restaurants found.
                </td>
              </tr>
            ) : (
              restaurants.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-text-primary">{r.name}</div>
                    <div className="text-xs text-gray-500 dark:text-text-muted">/{r.slug}</div>
                    <div className="text-[9px] text-gray-400 dark:text-text-muted/70 font-mono mt-0.5 select-all">ID: {r.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                      {r.subscription?.package?.name || "No Plan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-text-secondary">{r._count?.menuItems}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-text-muted">{formatDate(r.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRestaurant(r)}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      id={`toggle-restaurant-${r.id}`}
                      onClick={() => {
                        const action = r.isActive ? "suspend" : "activate";
                        if (confirm(`${action === "suspend" ? "Suspend" : "Activate"} "${r.name}"?`)) {
                          toggleSuspend(r.id);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        r.isActive 
                          ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30" 
                          : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/30"
                      }`}
                    >
                      {r.isActive ? (
                        <><ShieldOff className="w-3.5 h-3.5" /> Suspend</>
                      ) : (
                        <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RestaurantDetailsModal
        open={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        restaurant={selectedRestaurant}
      />
    </div>
  );
}