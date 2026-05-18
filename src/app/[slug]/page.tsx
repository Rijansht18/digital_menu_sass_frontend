export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicMenuClient } from "./PublicMenuClient";

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

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/public/menu/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { title: "Menu Not Found" };
    const result = await res.json();
    const restaurant: Restaurant = result?.data;
    if (!restaurant) return { title: "Menu Not Found" };

    const totalItems = restaurant.categories.reduce(
      (sum, c) => sum + c.items.length,
      0
    );

    return {
      title: `${restaurant.name} Menu`,
      description:
        restaurant.description ||
        `Explore the complete menu of ${restaurant.name} with ${totalItems} items across ${restaurant.categories.length} categories.`,
      icons: restaurant.logo ? {
        icon: restaurant.logo,
        shortcut: restaurant.logo,
        apple: restaurant.logo,
      } : {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/icons/icon-192x192.png",
      },
    };
  } catch (err) {
    return { title: "Digital Menu" };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let restaurant: Restaurant | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/public/menu/${slug}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const result = await res.json();
      restaurant = result?.data || null;
    }
  } catch (err) {
    console.error("Error fetching menu in digital-frontend page:", err);
  }

  if (!restaurant) notFound();

  return (
    <PublicMenuClient restaurant={restaurant} slug={slug} />
  );
}
