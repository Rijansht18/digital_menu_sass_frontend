"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Search, Star, LayoutGrid, List } from "lucide-react";
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
            <span className="font-bold text-text-primary shrink-0">${Number(item.price).toFixed(2)}</span>
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
          <span className="font-bold text-text-primary shrink-0">${Number(item.price).toFixed(2)}</span>
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

export function PublicMenuClient({ restaurant, slug }: { restaurant: Restaurant; slug?: string }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (restaurant) {
      try {
        sessionStorage.setItem(`restaurant_menu:${restaurant.id}`, JSON.stringify(restaurant));
      } catch (err) {
        console.error("Failed to write menu data to sessionStorage:", err);
      }
    }
  }, [restaurant]);
  
  const allFeaturedItems = restaurant.categories
    .flatMap((c) => c.items)
    .filter((i) => i.isFeatured)
    .slice(0, 6);

  const filteredCategories = restaurant.categories.map(cat => {
    if (!search) return cat;
    const q = search.toLowerCase();
    const filteredItems = cat.items.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description?.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
    return { ...cat, items: filteredItems };
  }).filter(cat => cat.items.length > 0);

  const renderItemDetailModal = () => {
    if (!selectedItem) return null;
    return (
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
              <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-display text-2xl font-bold text-text-primary">{selectedItem.name}</h3>
              <span className="font-bold text-2xl text-brand-400 shrink-0">${Number(selectedItem.price).toFixed(2)}</span>
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
    );
  };

  const getCategoryUrl = (category: Category) => {
    return slug ? `/${slug}/category/${category.slug}` : `/category/${category.id}`;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Banner */}
      <div className="relative h-52 sm:h-64 bg-surface-elevated overflow-hidden">
        {restaurant.banner ? (
          <Image src={restaurant.banner} alt={`${restaurant.name} banner`} fill className="object-cover" priority sizes="100vw" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        
        {/* Brand Logo & Name overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-card border border-surface-border/50">
          <div className="relative w-6 h-6 overflow-hidden rounded-md shrink-0">
            <Image src={restaurant.logo || "/menulogo.png"} alt={`${restaurant.name} logo`} fill className="object-cover" sizes="24px" unoptimized />
          </div>
          <span className="text-xs font-bold text-text-primary hidden sm:inline">{restaurant.name}</span>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-surface/80 backdrop-blur-md rounded-full p-1 shadow-card">
          <ThemeToggle />
        </div>
      </div>

      {/* Restaurant Info & Header */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-end gap-4 -mt-12 relative mb-6">
          <div className="w-20 h-20 rounded-2xl border-2 border-surface-border bg-surface-card overflow-hidden shrink-0 shadow-card relative">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={`${restaurant.name} logo`} fill className="object-cover" sizes="80px" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="flex items-center gap-1.5 text-sm text-text-muted mt-1">
                <MapPin className="w-3.5 h-3.5" /> {restaurant.address}
              </p>
            )}
          </div>
        </div>

        {restaurant.description && (
          <p className="text-text-secondary text-sm mb-6">{restaurant.description}</p>
        )}

        {/* Contact Links */}
        <div className="flex flex-wrap gap-4 mb-8">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-400 transition-colors">
              <Phone className="w-4 h-4" /> {restaurant.phone}
            </a>
          )}
          {restaurant.email && (
            <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-400 transition-colors">
              <Mail className="w-4 h-4" /> {restaurant.email}
            </a>
          )}
        </div>

        {/* Global Search & Grid/List Toggles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search menu..."
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-surface-elevated p-1 rounded-xl border border-surface-border shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-brand-600 text-white shadow-sm shadow-brand/20 scale-105" : "text-text-muted hover:text-text-primary"}`}
              title="Table/List View"
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

        {/* Global Search Results Render */}
        {search ? (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Search Results for "{search}"
              </h2>
              <span className="text-xs text-text-muted">
                Found {filteredCategories.reduce((sum, c) => sum + c.items.length, 0)} items
              </span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p>No items found matching "{search}"</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <section key={category.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-display text-md font-bold text-text-secondary">
                      In {category.name}
                    </h3>
                  </div>
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    {category.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} viewMode={viewMode} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Featured Items Discovery (Chef's Recommendations) */}
            {allFeaturedItems.length > 0 && (
              <section className="mb-10 relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-900/20 to-transparent rounded-3xl -z-10" />
                <div className="flex items-center gap-2 mb-4 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">Chef's Recommendations</h2>
                </div>
                
                {viewMode === "grid" ? (
                  <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
                    {allFeaturedItems.map((item) => (
                      <div key={item.id} className="w-[280px] shrink-0 snap-center">
                        <MenuItemCard item={item} onClick={() => setSelectedItem(item)} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allFeaturedItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} viewMode="list" />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* List of Categories Grid */}
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                📂 Browse Categories
              </h2>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {restaurant.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={getCategoryUrl(category)}
                      className="group glass-card-hover p-5 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          {category.image ? (
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 relative bg-surface-elevated">
                              <Image src={category.image} alt={category.name} fill className="object-cover" sizes="48px" unoptimized />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-xl font-bold">
                              🍽️
                            </div>
                          )}
                          <span className="badge badge-brand text-[11px]">
                            {category.items.length} items
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-brand-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-text-muted mt-2 line-clamp-2">
                          Explore our curated collection of delicious {category.name.toLowerCase()} selections.
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors pt-2 border-t border-surface-border/40">
                        View Category Menu <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {restaurant.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={getCategoryUrl(category)}
                      className="group glass-card-hover flex items-center justify-between p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {category.image ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative bg-surface-elevated border border-surface-border/40">
                            <Image src={category.image} alt={category.name} fill className="object-cover" sizes="56px" unoptimized />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-xl font-bold shrink-0">
                            🍽️
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-base text-text-primary group-hover:text-brand-400 transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5 truncate hidden sm:block">
                            Browse the complete list of {category.name.toLowerCase()} products.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="badge badge-brand text-[10px] px-2 py-0.5">
                          {category.items.length} items
                        </span>
                        <span className="text-brand-400 group-hover:translate-x-1 transition-transform font-bold text-sm">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-surface-border py-8 mt-8 text-center">
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
      {renderItemDetailModal()}
    </div>
  );
}
