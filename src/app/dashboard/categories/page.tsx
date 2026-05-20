"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
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
    defaultValues: editItem || { isActive: true, sortOrder: 0 },
  });

  useEffect(() => {
    if (editItem) {
      reset(editItem);
    } else {
      reset({ isActive: true, sortOrder: 0 });
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
      if (editItem) return api.put(`/categories/${editItem.id}`, data);
      return api.post("/categories", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-text-primary">
            {editItem ? "Edit Category" : "Add Category"}
          </h3>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutate(d))}
          id="category-form"
          className="space-y-4"
        >
          <div>
            <label className="label">Category Name</label>
            <input
              className={`input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Main Course"
              {...register("name")}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
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
            <label className="label">Sort Order</label>
            <input
              type="number"
              className="input"
              defaultValue={0}
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              {...register("isActive")}
            />
            <span className="text-sm text-text-secondary">Active</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="category-submit"
              disabled={isPending}
              className="btn-primary flex-1"
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
        </form>
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Categories
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            {categories.length} categories
          </p>
        </div>
        <button
          id="add-category-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))
        ) : categories.length === 0 ? (
          <div className="glass-card col-span-full p-12 text-center text-text-muted">
            No categories yet. Add your first!
          </div>
        ) : (
          categories.map((cat: any) => (
            <div key={cat.id} className="glass-card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold">
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {cat._count?.items ?? 0} items
                    </p>
                  </div>
                </div>
                <span
                  className={`badge ${cat.isActive ? "badge-success" : "badge-danger"}`}
                >
                  {cat.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditItem(cat);
                    setModalOpen(true);
                  }}
                  id={`edit-cat-${cat.id}`}
                  className="btn-ghost btn-sm flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${cat.name}"?`))
                      deleteCategory(cat.id);
                  }}
                  id={`delete-cat-${cat.id}`}
                  className="btn-danger btn-sm flex items-center gap-1.5"
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
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
    </div>
  );
}
