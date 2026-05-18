export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { CategoryMenuClient } from "@/components/CategoryMenuClient";

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

export default async function StandaloneCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurantId = process.env.VITE_RESTAURANT_ID || process.env.NEXT_PUBLIC_RESTAURANT_ID;

  if (!restaurantId) notFound();

  let restaurant: Restaurant | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/public/menu/id/${restaurantId}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const result = await res.json();
      restaurant = result?.data || null;
    }
  } catch (err) {
    console.error("Error fetching menu in standalone category page:", err);
  }

  if (!restaurant) notFound();

  const category = restaurant.categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <CategoryMenuClient
      restaurant={restaurant}
      category={category}
      backUrl="/"
    />
  );
}
