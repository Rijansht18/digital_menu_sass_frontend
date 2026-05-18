import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Privacy Policy | RestroSphere",
  description: "Learn how RestroSphere collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-border/50 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-surface-elevated">
                <img src="/menulogo.png" alt="RestroSphere logo" className="object-cover w-full h-full" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">RestroSphere</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/" className="btn-ghost btn-sm gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pt-32">
        <div className="glass-card p-8 md:p-12 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/10 flex items-center justify-center text-brand-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-text-primary">
                Privacy Policy
              </h1>
              <p className="text-text-muted text-xs mt-1">Last updated: May 17, 2026</p>
            </div>
          </div>

          <div className="prose dark:prose-invert space-y-6 text-sm text-text-secondary leading-relaxed">
            <p>
              At <strong>RestroSphere</strong>, accessible from restrosphere.com, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by RestroSphere and how we use it.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              1. Information We Collect
            </h2>
            <p>
              If you register for an account to manage your restaurant menu, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number. We isolate this data per tenant to prevent cross-leakage.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and maintain our digital menu platform.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Understand and analyze how you use our menu features and creator dashboard.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Send you emails regarding system updates or administrative notices.</li>
            </ul>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              3. Menu Caching & CDN Storage
            </h2>
            <p>
              To ensure blazing-fast load times (sub-2 seconds), public menu details and category assets are aggressively cached in Redis and client-side PWA environments. Restaurant banner images uploaded by you are hosted via ImageKit for optimal rendering.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              4. Contact Us
            </h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at support@restrosphere.com.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
