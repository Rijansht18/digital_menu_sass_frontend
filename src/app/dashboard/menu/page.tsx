"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
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
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      price: 0,
      image: "",
      isVeg: false,
      isSpicy: false,
      isFeatured: false,
      tags: "",
    },
  });

  useEffect(() => {
    if (editItem) {
      reset({
        name: editItem.name,
        categoryId: editItem.categoryId,
        description: editItem.description || "",
        price: Number(editItem.price),
        image: editItem.image || "",
        isVeg: editItem.isVeg || false,
        isSpicy: editItem.isSpicy || false,
        isFeatured: editItem.isFeatured || false,
        tags: editItem.tags?.join(", ") || "",
      });
    } else {
      reset({
        name: "",
        categoryId: "",
        description: "",
        price: 0,
        image: "",
        isVeg: false,
        isSpicy: false,
        isFeatured: false,
        tags: "",
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
      qc.invalidateQueries({ queryKey: ["categories"] });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error saving menu item:", error);
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
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

const formatPriceSafe = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-2 py-1 text-sm text-gray-500 dark:text-text-muted">...</span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-text-secondary dark:hover:bg-surface-card'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-elevated dark:text-text-secondary dark:hover:bg-surface-card"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MenuPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Items per page
  
  // Ref to store the scroll position
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollPosition = useRef(0);

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

  // API call with pagination parameters
  const { data: menuData, isLoading, isFetching } = useQuery({
    queryKey: ["menu-items", search, selectedCategory, currentPage],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limit,
      };
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      const res = await api.get("/menu-items", { params });
      return res.data.data;
    },
  });

  const items = menuData?.items || [];
  const pagination = menuData?.pagination || { page: currentPage, limit: limit, total: 0, pages: 0 };
  const totalPages = pagination.pages;

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const { mutate: deleteItem } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu-items/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/menu-items/${id}/toggle-availability`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const handleEdit = (item: any) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const handlePageChange = (page: number) => {
    // Save current scroll position of the table container
    if (tableContainerRef.current) {
      previousScrollPosition.current = tableContainerRef.current.scrollTop;
    }
    setCurrentPage(page);
    // Restore scroll position after state update
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = previousScrollPosition.current;
      }
    }, 0);
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, pagination.total);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-text-primary">
            Menu Items
          </h2>
          <p className="text-gray-500 dark:text-text-muted text-sm mt-0.5">
            {pagination.total} items in your menu
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

      {/* Top Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="text-sm text-gray-500 dark:text-text-muted">
            Showing {startIndex} to {endIndex} of {pagination.total} items
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Items Table Container with ref for scroll position */}
      <div 
        ref={tableContainerRef}
        className="overflow-x-auto rounded-xl border border-gray-200 dark:border-surface-border bg-white dark:bg-surface shadow-sm"
      >
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-surface-elevated border-b border-gray-200 dark:border-surface-border sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
            {isLoading || isFetching ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-surface-elevated rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-surface-elevated rounded" />
                        <div className="h-3 w-20 bg-gray-200 dark:bg-surface-elevated rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-20 bg-gray-200 dark:bg-surface-elevated rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-surface-elevated rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-surface-elevated rounded-lg" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-surface-elevated rounded-lg" />
                      <div className="h-8 w-8 bg-gray-200 dark:bg-surface-elevated rounded-lg" />
                    </div>
                  </td>
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
                          ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
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

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2 flex-wrap gap-3">
          <div className="text-sm text-gray-500 dark:text-text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      <ItemModal
        open={modalOpen}
        onClose={handleClose}
        categories={categories}
        editItem={editItem}
      />
    </div>
  );
}