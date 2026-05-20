import Link from "next/link";
import { Metadata } from "next";
import {
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Smartphone,
  Globe,
  ChevronRight,
  Check,
  ArrowRight,
  Menu,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "RestroSphere — Digital Menu SaaS for Restaurants",
  description:
    "Create beautiful digital menus for your restaurant. PWA-ready, SEO optimized, blazing fast. Start free today.",
    icons: "/menulogonobg.png",
};

const features = [
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "Sub-2 second load times with Redis caching and CDN-optimized images via ImageKit.",
    color: "text-accent-orange",
    bg: "bg-accent-orange/10",
  },
  {
    icon: Smartphone,
    title: "PWA Ready",
    description: "Your customers can install your menu as an app. Works offline with IndexedDB caching.",
    color: "text-brand-400",
    bg: "bg-brand-900/40",
  },
  {
    icon: Globe,
    title: "SEO Optimized",
    description: "Every menu page is server-side rendered with dynamic metadata and structured JSON-LD.",
    color: "text-accent-teal",
    bg: "bg-accent-teal/10",
  },
  {
    icon: BarChart3,
    title: "Real Analytics",
    description: "Track menu views, popular items, and customer engagement with beautiful dashboards.",
    color: "text-accent-pink",
    bg: "bg-accent-pink/10",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Secure",
    description: "Every query is tenant-isolated. Your data never leaks to other restaurants.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Sparkles,
    title: "Smart Caching",
    description: "Fetch once, cache aggressively. Menu refreshes only when you update it.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 9.99, yearly: 99.99 },
    description: "Perfect for small cafés and food stalls",
    features: [
      "30 menu items",
      "5 categories",
      "Public digital menu",
      "PWA support",
      "Basic customization",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: { monthly: 24.99, yearly: 249.99 },
    description: "For growing restaurants with full analytics",
    features: [
      "100 menu items",
      "20 categories",
      "Analytics dashboard",
      "Priority SEO",
      "PWA + offline mode",
      "Custom branding",
    ],
    cta: "Get Started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 49.99, yearly: 499.99 },
    description: "Full-featured for large restaurants & hotel chains",
    features: [
      "Unlimited menu items",
      "Unlimited categories",
      "Advanced analytics",
      "Custom themes",
      "Priority support",
      "White-label ready",
    ],
    cta: "Go Pro",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Owner, Spice Garden",
    avatar: "PS",
    quote:
      "RestroSphere transformed our ordering experience. Customers love being able to browse our menu before they even sit down!",
    rating: 5,
  },
  {
    name: "Marco Bianchi",
    role: "Manager, Bella Italia",
    avatar: "MB",
    quote:
      "The analytics alone are worth the price. I can see which dishes are popular and optimize our menu every week.",
    rating: 5,
  },
  {
    name: "Arun Thapa",
    role: "CEO, Mountain Hotels",
    avatar: "AT",
    quote:
      "We manage 5 hotels with one platform. The multi-tenant architecture is exactly what we needed.",
    rating: 5,
  },
];

export default async function LandingPage() {
  // Fetch packages from backend
  let backendPlans: any[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/subscription/packages`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const result = await res.json();
      if (result?.success && Array.isArray(result.data)) {
        backendPlans = result.data;
      }
    }
  } catch (err) {
    console.error("Error fetching packages in LandingPage:", err);
  }

  // Fallback to static plans if backend is unreachable or empty
  const displayPlans = backendPlans.length > 0 ? backendPlans.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: {
      monthly: Number(pkg.monthlyPrice),
      yearly: Number(pkg.yearlyPrice)
    },
    description: pkg.description || "Premium subscription package",
    features: [
      pkg.maxMenuItems === -1 || pkg.maxMenuItems >= 9999 ? "Unlimited menu items" : `${pkg.maxMenuItems} menu items`,
      pkg.maxCategories === -1 || pkg.maxCategories >= 9999 ? "Unlimited categories" : `${pkg.maxCategories} categories`,
      pkg.analyticsEnabled ? "Analytics dashboard" : "Basic menu reporting",
      pkg.customTheme ? "Custom themes & colors" : "Standard theme selection",
      pkg.prioritySupport ? "Priority support" : "Standard support",
    ],
    cta: Number(pkg.monthlyPrice) === 0 ? "Start Free" : "Get Started",
    highlighted: pkg.name.toLowerCase() === "growth" || pkg.name.toLowerCase() === "pro" || pkg.name.toLowerCase() === "premium",
    badge: pkg.name.toLowerCase() === "growth" ? "Most Popular" : undefined
  })) : plans;

  return (
    <div className="min-h-screen">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border/50 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-surface-elevated">
                <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">RestroSphere</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login" className="btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Get Started <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-accent-pink/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Multi-tenant Digital Menu Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            Your Menu.{" "}
            <span className="text-gradient">Digitized.</span>
            <br />
            <span className="text-text-secondary text-4xl sm:text-5xl font-bold">
              Perfected.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up">
            Create stunning digital menus that load in under 2 seconds, work offline,
            and drive more orders. Built for restaurants, hotels, and cafés of all sizes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link href="/register" className="btn-primary btn-lg group">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/hotel-abc" className="btn-secondary btn-lg">
              View Live Demo
            </Link>
          </div>

          <p className="mt-6 text-text-muted text-sm">
            No credit card required · Free 14-day trial · Cancel anytime
          </p>
        </div>

        {/* Hero Stats */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Menus Created" },
            { value: "< 2s", label: "Avg Load Time" },
            { value: "98%", label: "Uptime SLA" },
            { value: "50+", label: "Countries" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <div className="font-display text-3xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Why RestroSphere?
            </div>
            <h2 className="section-title mb-4">
              Everything your restaurant{" "}
              <span className="text-gradient">needs</span>
            </h2>
            <p className="section-subtitle mx-auto">
              From blazing-fast public menus to powerful admin dashboards — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card-hover p-6">
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/60 border border-brand-700/40 text-brand-300 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Simple Pricing
            </div>
            <h2 className="section-title mb-4">
              Plans for <span className="text-gradient">every</span> restaurant
            </h2>
            <p className="section-subtitle mx-auto">
              Start free, scale as you grow. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 border transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-surface-card border-brand-500 shadow-brand dark:bg-gradient-card dark:border-brand-600/60 dark:shadow-glow scale-[1.02]"
                    : "glass-card hover:border-brand-600/30 hover:-translate-y-1"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-brand text-white text-xs font-bold shadow-brand">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-text-primary">
                      Rs. {plan.price.monthly}
                    </span>
                    <span className="text-text-muted text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Rs. {plan.price.yearly}/yr (save {Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100)}%)
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={plan.highlighted ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              Loved by <span className="text-gradient">thousands</span> of restaurants
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card-hover p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">{t.name}</div>
                    <div className="text-xs text-text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Can I use my own domain?",
                a: "Yes! Each restaurant gets a unique slug (e.g. /your-restaurant). Custom domain support is available on the Pro plan.",
              },
              {
                q: "Does it work offline?",
                a: "Absolutely. Our PWA caches the full menu in IndexedDB. Customers can browse even without internet.",
              },
              {
                q: "How is the menu kept fresh?",
                a: "We use a menuVersion system. The PWA only re-fetches when the version changes — minimizing API calls.",
              },
              {
                q: "Is my data secure?",
                a: "Yes. Every database query is filtered by restaurantId. No data leaks between tenants.",
              },
            ].map((faq) => (
              <div key={faq.q} className="glass-card p-6">
                <h4 className="font-semibold text-text-primary mb-2">{faq.q}</h4>
                <p className="text-sm text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-4xl overflow-hidden bg-surface-card dark:bg-gradient-card border border-brand-500/20 dark:border-brand-700/40 p-12 text-center shadow-brand">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent dark:from-brand-900/50 dark:to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 dark:bg-brand-600/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-4xl font-extrabold text-text-primary mb-4">
                Ready to go digital?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Join 10,000+ restaurants who chose RestroSphere. Start your free trial today.
              </p>
              <Link href="/register" className="btn-primary btn-lg">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-surface-elevated">
              <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
            </div>
            <span className="font-display font-bold text-gradient">RestroSphere</span>
          </div>
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} RestroSphere. All rights reserved. Developed by <a href="https://xpoundai.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-brand-400 transition-colors">xpoundai</a>.
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <a href="mailto:support@restrosphere.com" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
