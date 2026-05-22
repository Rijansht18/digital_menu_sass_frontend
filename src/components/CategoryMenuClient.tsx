"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, LayoutGrid, List } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  address?: string;
  menuVersion: number;
  categories: Category[];
}

function MenuItemCard({ item, onClick, viewMode }: { item: MenuItem; onClick: () => void; viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div onClick={onClick} className="group glass-card-hover flex gap-4 p-4 cursor-pointer">
        {item.image ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-elevated relative">
            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" unoptimized />
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 bg-surface-elevated flex items-center justify-center text-3xl">🍽️</div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate group-hover:text-brand-400 transition-colors">
              {item.name}
            </h3>
            <span className="font-bold text-text-primary shrink-0">Rs. {Number(item.price).toFixed(2)}</span>
          </div>
          {item.description && <p className="text-xs text-text-muted line-clamp-1 mb-2">{item.description}</p>}
          <div className="flex flex-wrap gap-1 mt-auto">
            {item.isVeg !== undefined && (
              <span className={`badge text-[10px] px-1.5 py-0.5 ${item.isVeg ? "badge-veg" : "badge-nonveg"}`}>
                {item.isVeg ? "Veg" : "Non-veg"}
              </span>
            )}
            {item.isSpicy && <span className="badge badge-warning text-[10px] px-1.5 py-0.5">Spicy</span>}
            {!item.isAvailable && <span className="text-[10px] text-danger font-medium ml-auto">Unavailable</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="group glass-card transition-all duration-300 hover:border-brand-600/40 hover:shadow-glow hover:scale-[1.02] flex flex-col overflow-hidden h-full cursor-pointer">
      <div className="w-full aspect-[4/3] bg-surface-elevated relative overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 300px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {item.isFeatured && <span className="badge badge-warning shadow-md shadow-black/20"><Star className="w-3 h-3 fill-current mr-1" /> Featured</span>}
          {item.isVeg !== undefined && (
            <span className={`badge shadow-md shadow-black/20 ${item.isVeg ? "badge-veg" : "badge-nonveg"}`}>
              {item.isVeg ? "Veg" : "Non-veg"}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-text-primary text-sm sm:text-base line-clamp-2 group-hover:text-brand-400 transition-colors">
            {item.name}
          </h3>
          <span className="font-bold text-text-primary shrink-0">Rs. {Number(item.price).toFixed(2)}</span>
        </div>
        {item.description && <p className="text-xs text-text-muted line-clamp-2 mt-1">{item.description}</p>}
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-surface-border">
                #{tag}
              </span>
            ))}
          </div>
          {!item.isAvailable && <span className="text-[10px] text-danger font-medium">Unavailable</span>}
        </div>
      </div>
    </div>
  );
}

export function CategoryMenuClient({
  restaurant,
  category,
  backUrl,
}: {
  restaurant: Restaurant;
  category: Category;
  backUrl: string;
}) {
  const [categorySearch, setCategorySearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Dynamic Client-side Cache loading for instant zero-server category transition
  const [localRestaurant, setLocalRestaurant] = useState<Restaurant>(restaurant);
  const [localCategory, setLocalCategory] = useState<Category>(category);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`restaurant_menu:${restaurant.id}`);
      if (cached) {
        const parsed = JSON.parse(cached) as Restaurant;
        // Verify cache version is fresh before applying
        if (parsed.menuVersion >= restaurant.menuVersion) {
          const cat = parsed.categories.find(c => c.id === category.id || c.slug === category.slug);
          if (cat) {
            setLocalRestaurant(parsed);
            setLocalCategory(cat);
            return;
          }
        }
      }
      
      // Cache is stale or missing, update sessionStorage with the fresh server data
      sessionStorage.setItem(`restaurant_menu:${restaurant.id}`, JSON.stringify(restaurant));
      setLocalRestaurant(restaurant);
      setLocalCategory(category);
    } catch (err) {
      console.error("Failed to load restaurant from session storage cache:", err);
    }
  }, [restaurant, category]);

  const q = categorySearch.toLowerCase();
  const filteredCategoryItems = localCategory.items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.tags.some(t => t.toLowerCase().includes(q))
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Banner */}
      <div className="relative h-44 sm:h-52 bg-surface-elevated overflow-hidden">
        {localCategory.image || localRestaurant.banner ? (
          <Image src={localCategory.image || localRestaurant.banner || ""} alt={localCategory.name} fill className="object-cover" priority sizes="100vw" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        
        {/* Brand Logo & Name overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-card border border-surface-border/40">
          <div className="relative w-6 h-6 overflow-hidden rounded-md shrink-0">
            <Image src={localRestaurant.logo || "/menulogo.png"} alt={`${localRestaurant.name} logo`} fill className="object-cover" sizes="24px" unoptimized />
          </div>
          <span className="text-xs font-bold text-text-primary hidden sm:inline">{localRestaurant.name}</span>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-surface/80 backdrop-blur-md rounded-full p-1 shadow-card">
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative pb-16">
        {/* Back Navigation & Category Details */}
        <div className="mb-6 flex flex-col gap-4">
          <Link
            href={backUrl}
            className="btn-secondary w-fit px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-semibold"
          >
            ← Back to Main Menu
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-text-primary">
                {localCategory.name}
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Showing {filteredCategoryItems.length} of {localCategory.items.length} items
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex bg-surface-elevated p-1 rounded-xl border border-surface-border self-start sm:self-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-brand-600 text-white shadow-sm shadow-brand/20 scale-105" : "text-text-muted hover:text-text-primary"}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-brand-600 text-white shadow-sm shadow-brand/20 scale-105" : "text-text-muted hover:text-text-primary"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Search Input */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder={`Search within ${localCategory.name}...`}
            className="input pl-11"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />
        </div>

        {/* Category Items List/Grid */}
        {filteredCategoryItems.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p>No items found inside this category matching "{categorySearch}"</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in" : "grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in"}>
            {filteredCategoryItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-surface-border py-8 mt-12 text-center">
          <p className="text-xs text-text-muted flex items-center justify-center gap-1.5">
            Powered by{" "}
            <Image src="/menulogo.png" alt="Restrosphere logo" width={16} height={16} className="object-contain" />
            <Link href="/" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Restrosphere Digital Menu
            </Link>
          </p>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card w-full max-w-lg p-0 overflow-hidden animate-scale-in relative">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface/60 backdrop-blur-md text-text-primary hover:bg-surface/80 transition-colors"
            >
              ✕
            </button>
            <div className="relative w-full aspect-video bg-surface-elevated">
              {selectedItem.image ? (
                <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-display text-2xl font-bold text-text-primary">{selectedItem.name}</h3>
                <span className="font-bold text-2xl text-brand-400 shrink-0">Rs. {Number(selectedItem.price).toFixed(2)}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.isVeg !== undefined && (
                  <span className={`badge ${selectedItem.isVeg ? "badge-veg" : "badge-nonveg"}`}>
                    {selectedItem.isVeg ? "Veg" : "Non-veg"}
                  </span>
                )}
                {selectedItem.isSpicy && <span className="badge badge-warning">Spicy 🌶️</span>}
                {selectedItem.isFeatured && <span className="badge badge-brand">Chef Special ⭐</span>}
              </div>

              {selectedItem.description && (
                <p className="text-text-secondary text-sm mb-6 leading-relaxed">{selectedItem.description}</p>
              )}

              {selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-surface-elevated text-text-secondary border border-surface-border">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setSelectedItem(null)} 
                className="btn-primary w-full justify-center"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
