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
import { formatPrice, slugify } from "@/lib/utils";
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
    watch,
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

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => {
      const res = await api.get("/restaurant/profile");
      return res.data.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: MenuItemForm) => {
      const payload = {
        ...data,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-surface-border">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-text-primary">
                {editItem ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form
                onSubmit={handleSubmit((d) => mutate(d))}
                id="menu-item-form"
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                      Item Name
                    </label>
                    <input
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all ${
                        errors.name 
                          ? "border-red-500 dark:border-red-400" 
                          : "border-gray-300 dark:border-surface-border"
                      }`}
                      placeholder="e.g. Butter Chicken"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                      Category
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all ${
                        errors.categoryId 
                          ? "border-red-500 dark:border-red-400" 
                          : "border-gray-300 dark:border-surface-border"
                      }`}
                      {...register("categoryId")}
                    >
                      <option value="">Select category</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      onWheel={(e) => e.currentTarget.blur()}
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all ${
                        errors.price 
                          ? "border-red-500 dark:border-red-400" 
                          : "border-gray-300 dark:border-surface-border"
                      }`}
                      placeholder="0.00"
                      {...register("price", { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all resize-none"
                      rows={2}
                      placeholder="Describe this dish..."
                      {...register("description")}
                    />
                  </div>

                  <div className="col-span-2">
                    <Controller
                      control={control}
                      name="image"
                      render={({ field }) => {
                        const categoryId = watch("categoryId");
                        const categoryObj = categories.find(
                          (c: any) => c.id === categoryId,
                        );
                        const categorySlug =
                          categoryObj?.slug ??
                          (categoryObj?.name ? slugify(categoryObj.name) : undefined);
                        const restaurantSlug = restaurant?.name
                          ? slugify(restaurant.name)
                          : undefined;
                        const folder = restaurantSlug
                          ? `restaurants/${restaurantSlug}/menu-items/${categorySlug || "uncategorized"}`
                          : undefined;

                        return (
                          <ImageUpload
                            label="Image (optional)"
                            value={field.value || ""}
                            onChange={field.onChange}
                            folderPath={folder}
                            category={categorySlug}
                            tags={["menu-item"]}
                          />
                        );
                      }}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all"
                      placeholder="spicy, popular, new"
                      {...register("tags")}
                    />
                  </div>
                </div>

                <div className="flex gap-6 p-4 rounded-xl bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-surface-border text-brand-600 focus:ring-brand-500"
                      {...register("isVeg")}
                    />
                    <span className="text-sm text-gray-700 dark:text-text-secondary">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-surface-border text-brand-600 focus:ring-brand-500"
                      {...register("isSpicy")}
                    />
                    <span className="text-sm text-gray-700 dark:text-text-secondary">Spicy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-surface-border text-brand-600 focus:ring-brand-500"
                      {...register("isFeatured")}
                    />
                    <span className="text-sm text-gray-700 dark:text-text-secondary">Featured</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-surface/80 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="menu-item-form"
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : editItem ? (
                  "Update Item"
                ) : (
                  "Add Item"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format price safely
const formatPriceSafe = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

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

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => {
      const res = await api.get("/restaurant/profile");
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
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">
            Menu Items
          </h2>
          <p className="text-gray-500 dark:text-text-muted text-sm mt-0.5">
            {items.length} items in your menu
          </p>
        </div>
        <button
          id="add-menu-item-btn"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-text-muted" />
          <input
            id="menu-search"
            type="search"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-surface-border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="category-filter"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-surface-border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all sm:w-52"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-surface-elevated border-b border-gray-200 dark:border-surface-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-5 bg-gray-200 dark:bg-surface-elevated rounded" />
                     </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-text-muted">
                  No menu items found. Add your first item!
                </td>
              </tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-elevated shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🍽️
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-text-primary">
                          {item.name}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {item.isVeg !== undefined && (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                item.isVeg 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {item.isVeg ? "Veg" : "Non-Veg"}
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                      {item.category?.name || "–"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-text-primary">
                    Rs. {formatPriceSafe(item.price)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        item.isAvailable
                          ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-400 dark:hover:bg-green-900/30"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-surface-elevated dark:text-text-muted dark:hover:bg-surface-card"
                      }`}
                      aria-label={`Toggle availability for ${item.name}`}
                    >
                      {item.isAvailable ? (
                        <>
                          <ToggleRight className="w-4 h-4" /> Available
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" /> Unavailable
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        id={`edit-item-${item.id}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:text-text-muted dark:hover:text-brand-400 dark:hover:bg-brand-900/20 transition-all duration-200"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`))
                            deleteItem(item.id);
                        }}
                        id={`delete-item-${item.id}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-text-muted dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
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