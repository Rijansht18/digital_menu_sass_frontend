"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { Plus, Pencil, Trash2, Loader2, X, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const packageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, "Must be >= 0"),
  yearlyPrice: z.number().min(0, "Must be >= 0"),
  maxMenuItems: z.number().min(1, "Must be > 0"),
  maxCategories: z.number().min(1, "Must be > 0"),
  analyticsEnabled: z.boolean().default(false),
  customTheme: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
});
type PackageForm = z.infer<typeof packageSchema>;

function PackageModal({ open, onClose, editItem }: { open: boolean, onClose: () => void, editItem?: any }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PackageForm>({
    resolver: zodResolver(packageSchema),
    defaultValues: editItem || {
      analyticsEnabled: false,
      customTheme: false,
      prioritySupport: false,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        ...editItem,
        monthlyPrice: Number(editItem.monthlyPrice),
        yearlyPrice: Number(editItem.yearlyPrice),
      });
    } else {
      reset({
        analyticsEnabled: false,
        customTheme: false,
        prioritySupport: false,
      });
    }
  }, [editItem, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PackageForm) => {
      if (editItem) return api.put(`/superadmin/packages/${editItem.id}`, data);
      return api.post("/superadmin/packages", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packages"] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card w-full max-w-lg p-6 my-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-400" />
            {editItem ? "Edit Package" : "Create Package"}
          </h3>
          <button onClick={onClose} className="btn-icon btn-ghost"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Package Name</label>
              <input className={`input ${errors.name ? "input-error" : ""}`} placeholder="e.g. Pro Plan" {...register("name")} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} {...register("description")} />
            </div>

            <div>
              <label className="label">Monthly Price ($)</label>
              <input type="number" step="0.01" className={`input ${errors.monthlyPrice ? "input-error" : ""}`} {...register("monthlyPrice", { valueAsNumber: true })} />
              {errors.monthlyPrice && <p className="error-text">{errors.monthlyPrice.message}</p>}
            </div>

            <div>
              <label className="label">Yearly Price ($)</label>
              <input type="number" step="0.01" className={`input ${errors.yearlyPrice ? "input-error" : ""}`} {...register("yearlyPrice", { valueAsNumber: true })} />
              {errors.yearlyPrice && <p className="error-text">{errors.yearlyPrice.message}</p>}
            </div>

            <div>
              <label className="label">Max Menu Items</label>
              <input type="number" className={`input ${errors.maxMenuItems ? "input-error" : ""}`} {...register("maxMenuItems", { valueAsNumber: true })} />
              {errors.maxMenuItems && <p className="error-text">{errors.maxMenuItems.message}</p>}
            </div>

            <div>
              <label className="label">Max Categories</label>
              <input type="number" className={`input ${errors.maxCategories ? "input-error" : ""}`} {...register("maxCategories", { valueAsNumber: true })} />
              {errors.maxCategories && <p className="error-text">{errors.maxCategories.message}</p>}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3 mt-2">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Features</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("analyticsEnabled")} />
              <span className="text-sm text-text-secondary">Analytics Enabled</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("customTheme")} />
              <span className="text-sm text-text-secondary">Custom Theme Support</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("prioritySupport")} />
              <span className="text-sm text-text-secondary">Priority Support</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editItem ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperadminPackagesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get("/superadmin/packages");
      return res.data.data;
    },
  });

  const { mutate: deletePackage } = useMutation({
    mutationFn: async (id: string) => api.delete(`/superadmin/packages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });

  const handleEdit = (pkg: any) => {
    setEditItem(pkg);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Subscription Packages</h2>
          <p className="text-text-muted text-sm mt-0.5">Manage platform pricing plans</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))
        ) : packages.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-text-muted">
            No packages found. Create one!
          </div>
        ) : (
          packages.map((pkg: any) => (
            <div key={pkg.id} className="glass-card flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-text-primary">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">{pkg.description}</p>}
                  </div>
                  <span className={`badge ${pkg.isActive ? "badge-success" : "badge-danger"}`}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-end gap-1 mb-6">
                  <span className="font-display text-3xl font-bold text-gradient">{formatPrice(pkg.monthlyPrice)}</span>
                  <span className="text-text-muted text-sm mb-1">/mo</span>
                </div>

                <div className="space-y-2 text-sm text-text-secondary mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    Up to {pkg.maxMenuItems} menu items
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    Up to {pkg.maxCategories} categories
                  </div>
                  {pkg.analyticsEnabled && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      Detailed Analytics
                    </div>
                  )}
                  {pkg.customTheme && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      Custom Themes
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-surface-border bg-surface-elevated/50 flex justify-between items-center rounded-b-2xl">
                <div className="text-xs text-text-muted">
                  {pkg._count?.subscriptions || 0} active subs
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="btn-icon btn-ghost btn-sm">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Delete package "${pkg.name}"?`)) deletePackage(pkg.id);
                    }} 
                    className="btn-icon btn-danger btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PackageModal open={modalOpen} onClose={handleClose} editItem={editItem} />
    </div>
  );
}
