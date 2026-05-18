import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Terms of Service | RestroSphere",
  description: "Read the Terms of Service for using RestroSphere's digital menu platform.",
};

export default function TermsPage() {
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-text-primary">
                Terms of Service
              </h1>
              <p className="text-text-muted text-xs mt-1">Last updated: May 17, 2026</p>
            </div>
          </div>

          <div className="prose dark:prose-invert space-y-6 text-sm text-text-secondary leading-relaxed">
            <p>
              Welcome to <strong>RestroSphere</strong>. By accessing our website and using our digital menu SaaS services, you agree to comply with and be bound by the following Terms of Service. Please review these terms carefully.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              1. Agreement to Terms
            </h2>
            <p>
              By creating an account, launching a public QR menu, or purchasing a subscription plan (Starter, Growth, Pro), you agree to be bound by these Terms. If you do not agree to all terms, you may not access or use the platform.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              2. Subscriptions & Billing
            </h2>
            <p>
              Subscriptions are billed on a monthly or yearly cycle. Prices are determined in accordance with the backend pricing engine. All cancellations must be initiated via the subscription billing tab in your restaurant admin dashboard before the next renewal date.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              3. Custom Customizations & Domain Policies
            </h2>
            <p>
              Usage of custom themes and public menu branding changes must comply with intellectual property laws. We do not permit hosting of illegal, defamatory, or abusive content. Every query is filtered per tenant for maximum data security.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              4. Service Availability
            </h2>
            <p>
              RestroSphere uses Redis cache, PWA service workers, and distributed CDNs to ensure 98% uptime. However, we are not responsible for direct or indirect losses caused by network downtimes or external payment processor disruptions.
            </p>

            <h2 className="font-display text-xl font-bold text-text-primary pt-4 border-t border-surface-border">
              5. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the local laws, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
