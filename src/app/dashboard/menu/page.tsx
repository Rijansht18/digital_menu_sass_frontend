"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";

const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  image: z.string().optional(),
  isVeg: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional(),
});
type MenuItemForm = z.infer<typeof menuItemSchema>;

function ItemModal({
  open,
  onClose,
  categories,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  categories: any[];
  editItem?: any;
}) {
  const qc = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: editItem
      ? {
          ...editItem,
          tags: editItem.tags?.join(", "),
          price: Number(editItem.price),
        }
      : { isFeatured: false },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        ...editItem,
        tags: editItem.tags?.join(", "),
        price: Number(editItem.price),
      });
    } else {
      reset({ isFeatured: false });
    }
  }, [editItem, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: MenuItemForm) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        const res = await api.put(`/menu-items/${editItem.id}`, payload);
        return res.data;
      }
      const res = await api.post("/menu-items", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-text-primary">
            {editItem ? "Edit Menu Item" : "Add Menu Item"}
          </h3>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} id="menu-item-form" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Item Name</label>
              <input className={`input ${errors.name ? "input-error" : ""}`} placeholder="e.g. Butter Chicken" {...register("name")} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Category</label>
              <select className={`input ${errors.categoryId ? "input-error" : ""}`} {...register("categoryId")}>
                <option value="">Select category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="error-text">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="label">Price ($)</label>
              <input type="number" step="0.01" className={`input ${errors.price ? "input-error" : ""}`} placeholder="0.00" {...register("price", { valueAsNumber: true })} />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Description (optional)</label>
              <textarea className="input resize-none" rows={2} placeholder="Describe this dish..." {...register("description")} />
            </div>

            <div className="col-span-2">
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload
                    label="Image (optional)"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="col-span-2">
              <label className="label">Tags (comma separated)</label>
              <input className="input" placeholder="spicy, popular, new" {...register("tags")} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("isVeg")} />
              <span className="text-sm text-text-secondary">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("isSpicy")} />
              <span className="text-sm text-text-secondary">Spicy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register("isFeatured")} />
              <span className="text-sm text-text-secondary">Featured</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" id="menu-item-submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editItem ? "Update Item" : "Add Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data;
    },
  });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ["menu-items", search, selectedCategory],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      const res = await api.get("/menu-items", { params });
      return res.data.data;
    },
  });

  const items = menuData?.items || [];

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu-items/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/menu-items/${id}/toggle-availability`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });

  const handleEdit = (item: any) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Menu Items</h2>
          <p className="text-text-muted text-sm mt-0.5">{items.length} items in your menu</p>
        </div>
        <button
          id="add-menu-item-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="menu-search"
            type="search"
            placeholder="Search items..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="category-filter"
          className="input sm:w-52"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-muted">
                  No menu items found. Add your first item!
                </td>
              </tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-elevated shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={40} height={40} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary text-sm">{item.name}</div>
                        <div className="flex gap-1 mt-0.5">
                          {item.isVeg !== undefined && (
                            <span className={`badge text-xs ${item.isVeg ? "badge-veg" : "badge-nonveg"}`}>
                              {item.isVeg ? "🟢" : "🔴"}
                            </span>
                          )}
                          {item.isFeatured && <span className="badge badge-warning text-xs">⭐</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-brand">{item.category?.name || "–"}</span>
                  </td>
                  <td className="font-semibold text-text-primary">{formatPrice(item.price)}</td>
                  <td>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        item.isAvailable ? "text-success hover:text-success/70" : "text-text-muted hover:text-text-secondary"
                      }`}
                      aria-label={`Toggle availability for ${item.name}`}
                    >
                      {item.isAvailable ? (
                        <><ToggleRight className="w-5 h-5" /> Available</>
                      ) : (
                        <><ToggleLeft className="w-5 h-5" /> Unavailable</>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        id={`edit-item-${item.id}`}
                        className="btn-icon btn-ghost btn-sm"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) deleteItem(item.id);
                        }}
                        id={`delete-item-${item.id}`}
                        className="btn-icon btn-danger btn-sm"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ItemModal
        open={modalOpen}
        onClose={handleClose}
        categories={categories}
        editItem={editItem}
      />
    </div>
  );
}
