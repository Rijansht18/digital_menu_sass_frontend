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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            Restaurant Details
          </h3>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Column 1: Info & Owner */}
          <div className="space-y-6">
            <div>
              <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">General Info</div>
              <div className="space-y-1 bg-surface-elevated/40 border border-surface-border/60 p-4 rounded-xl">
                <div className="font-semibold text-text-primary text-base">{restaurant.name}</div>
                <div className="text-sm text-brand-400 font-mono">/{restaurant.slug}</div>
                <div className="text-[10px] text-text-muted font-mono mt-1 select-all bg-surface-card border border-surface-border/50 px-1.5 py-0.5 rounded w-max">ID: {restaurant.id}</div>
                {restaurant.phone && <div className="text-xs text-text-secondary mt-2">📞 {restaurant.phone}</div>}
                {restaurant.address && <div className="text-xs text-text-secondary">📍 {restaurant.address}</div>}
              </div>
            </div>

            {owner && (
              <div>
                <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Account Owner
                </div>
                <div className="bg-surface-elevated/40 border border-surface-border/60 p-4 rounded-xl space-y-2">
                  <div className="font-medium text-text-primary text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-text-muted" /> {owner.name}
                  </div>
                  <div className="text-xs text-text-secondary flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-text-muted" /> {owner.email}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Registration Details
              </div>
              <div className="bg-surface-elevated/40 border border-surface-border/60 p-4 rounded-xl text-xs space-y-1">
                <div className="text-text-primary">
                  Registered on <strong>{new Date(restaurant.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</strong>
                </div>
                <div className="text-text-muted">
                  Time: {new Date(restaurant.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Subscription & Usage */}
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-brand-900/10 border border-brand-800/30">
              <div className="text-xs text-text-muted mb-3 uppercase tracking-wider font-semibold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-brand-400" /> Subscription Plan
              </div>
              {sub ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-gradient text-lg">{pkg?.name} Plan</span>
                    <span className={`badge ${sub.isActive ? "badge-success" : "badge-danger"}`}>
                      {sub.isActive ? "Active" : "Expired"}
                    </span>
                  </div>

                  <div className="border-t border-surface-border/40 my-2 pt-2 text-xs space-y-1.5">
                    <div className="flex justify-between text-text-primary">
                      <span>Billing Cycle:</span>
                      <span className="font-bold capitalize">{sub.billingCycle}</span>
                    </div>
                    <div className="flex justify-between text-text-primary">
                      <span>Plan Price:</span>
                      <span className="font-bold text-brand-400">
                        ${price.toFixed(2)} / {isYearly ? "year" : "month"}
                      </span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Start Date:</span>
                      <span>{formatDate(sub.startDate)}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Renewal Date:</span>
                      <span>{formatDate(sub.endDate)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-muted py-2">No active subscription</div>
              )}
            </div>

            <div>
              <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">Usage & Limits</div>
              <div className="space-y-3 bg-surface-elevated/40 border border-surface-border/60 p-4 rounded-xl text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-text-secondary">
                    <span>Menu Items</span>
                    <span className="font-medium">{restaurant._count?.menuItems || 0} / {pkg?.maxMenuItems ?? "∞"}</span>
                  </div>
                  {pkg?.maxMenuItems && (
                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((restaurant._count?.menuItems || 0) / pkg.maxMenuItems) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-text-secondary">
                    <span>Categories</span>
                    <span className="font-medium">{restaurant._count?.categories || 0} / {pkg?.maxCategories ?? "∞"}</span>
                  </div>
                  {pkg?.maxCategories && (
                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((restaurant._count?.categories || 0) / pkg.maxCategories) * 100)}%` }}
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
          <h2 className="font-display text-2xl font-bold text-text-primary">Restaurants</h2>
          <p className="text-text-muted text-sm mt-0.5">{data?.pagination?.total ?? 0} total restaurants</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            id="sa-restaurant-search"
            type="search"
            placeholder="Search restaurants..."
            className="input pl-10 sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Plan</th>
              <th>Items</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-text-muted">No restaurants found.</td>
              </tr>
            ) : (
              restaurants.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <div className="font-medium text-text-primary">{r.name}</div>
                    <div className="text-xs text-text-muted">/{r.slug}</div>
                    <div className="text-[9px] text-text-muted/70 font-mono mt-0.5 select-all">ID: {r.id}</div>
                  </td>
                  <td>
                    <span className="badge-brand">{r.subscription?.package?.name || "No Plan"}</span>
                  </td>
                  <td className="text-text-secondary">{r._count?.menuItems}</td>
                  <td className="text-text-muted text-xs">{formatDate(r.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => setSelectedRestaurant(r)}
                      className="btn-ghost btn-sm text-brand-400 hover:text-brand-300"
                    >
                      View Details
                    </button>
                  </td>
                  <td>
                    <button
                      id={`toggle-restaurant-${r.id}`}
                      onClick={() => {
                        const action = r.isActive ? "suspend" : "activate";
                        if (confirm(`${action === "suspend" ? "Suspend" : "Activate"} "${r.name}"?`)) {
                          toggleSuspend(r.id);
                        }
                      }}
                      className={`btn-sm flex items-center gap-1.5 ${r.isActive ? "btn-danger" : "btn-secondary"}`}
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
