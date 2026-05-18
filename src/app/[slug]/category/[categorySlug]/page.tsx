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

export default async function SlugCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  
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
    console.error("Error fetching menu in category page:", err);
  }

  if (!restaurant) notFound();

  const category = restaurant.categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  return (
    <CategoryMenuClient
      restaurant={restaurant}
      category={category}
      backUrl={`/${slug}`}
    />
  );
}
