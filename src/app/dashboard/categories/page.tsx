"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
type CategoryForm = z.infer<typeof categorySchema>;

function CategoryModal({
  open,
  onClose,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  editItem?: any;
}) {
  const qc = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        name: editItem.name,
        image: editItem.image || "",
        sortOrder: editItem.sortOrder || 0,
        isActive: editItem.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        image: "",
        sortOrder: 0,
        isActive: true,
      });
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
    mutationFn: async (data: CategoryForm) => {
      if (editItem) {
        const res = await api.put(`/categories/${editItem.id}`, data);
        return res.data;
      }
      const res = await api.post("/categories", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error saving category:", error);
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-surface-border">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-text-primary">
                {editItem ? "Edit Category" : "Add Category"}
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-text-muted dark:hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form
                onSubmit={handleSubmit((d) => mutate(d))}
                id="category-form"
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                    Category Name
                  </label>
                  <input
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all ${
                      errors.name 
                        ? "border-red-500 dark:border-red-400" 
                        : "border-gray-300 dark:border-surface-border"
                    }`}
                    placeholder="e.g. Main Course"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Controller
                    control={control}
                    name="image"
                    render={({ field }) => {
                      const categoryName = watch("name") || editItem?.name || "";
                      const categorySlug = categoryName
                        ? slugify(categoryName)
                        : undefined;
                      const restaurantSlug = restaurant?.name
                        ? slugify(restaurant.name)
                        : undefined;
                      const folder = restaurantSlug
                        ? `restaurants/${restaurantSlug}/categories/${categorySlug || "uncategorized"}`
                        : undefined;
                      return (
                        <ImageUpload
                          label="Image (optional)"
                          value={field.value || ""}
                          onChange={field.onChange}
                          folderPath={folder}
                          category={categorySlug}
                          tags={["category"]}
                        />
                      );
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-surface-border bg-white dark:bg-surface-elevated text-gray-900 dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all"
                    {...register("sortOrder", { valueAsNumber: true })}
                  />
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-surface-elevated/40 border border-gray-200 dark:border-surface-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-surface-border text-brand-600 focus:ring-brand-500"
                      {...register("isActive")}
                    />
                    <span className="text-sm text-gray-700 dark:text-text-secondary">Active</span>
                  </label>
                </div>
              </form>
            </div>

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
                form="category-form"
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : editItem ? (
                  "Update"
                ) : (
                  "Add Category"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data;
    },
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const handleEdit = (cat: any) => {
    setEditItem(cat);
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
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">
            Categories
          </h2>
          <p className="text-gray-500 dark:text-text-muted text-sm mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button
          id="add-category-btn"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-surface-elevated animate-pulse" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-text-muted bg-gray-50 dark:bg-surface-elevated/20 rounded-2xl border border-gray-200 dark:border-surface-border">
            No categories yet. Add your first!
          </div>
        ) : (
          categories.map((cat: any) => (
            <div 
              key={cat.id} 
              className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-surface-border p-5 hover:shadow-lg transition-all duration-200 hover:border-brand-200 dark:hover:border-brand-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-elevated">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-text-primary">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-text-muted">
                      {cat._count?.items ?? 0} items
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cat.isActive 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                  }`}
                >
                  {cat.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-surface-border">
                <button
                  onClick={() => handleEdit(cat)}
                  id={`edit-cat-${cat.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${cat.name}"?`))
                      deleteCategory(cat.id);
                  }}
                  id={`delete-cat-${cat.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={handleClose}
        editItem={editItem}
      />
    </div>
  );
}