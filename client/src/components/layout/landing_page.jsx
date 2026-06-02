import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  Moon,
  Network,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import api from "../../api/api";

const navLinks = ["Platform", "Solutions", "Pricing", "Resources"];

const planIcons = {
  warehouse: Warehouse,
  boxes: Boxes,
  "bar-chart": BarChart3,
  network: Network,
};

const metrics = [
  { label: "Shipment visibility", value: "99.9%" },
  { label: "Faster planning cycles", value: "42%" },
  { label: "Active warehouse sites", value: "1.8k" },
];

const cardMotion = {
  hidden: { opacity: 0, y: 28 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: index * 0.12, ease: "easeOut" },
  }),
};

/* ─── Navbar ─── */
function Navbar({ isDark, onThemeToggle }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/85 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
              FlowChain
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              SCM Cloud
            </p>
          </div>
        </a>

        {/* Nav Links */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={link === "Pricing" ? "/pricing" : "#"}
              className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label="Toggle color theme"
            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="/pricing"
            className="hidden rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 sm:inline-flex"
          >
            View Plans
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]" />
      {/* Top gradient wash */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-gray-100/60 to-transparent dark:from-gray-900/40" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Sparkles size={13} className="text-gray-400" />
            Smart pricing for connected operations
          </div>

          {/* Heading */}
          <h1 className="max-w-xl text-[2.75rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-[3.5rem]">
            Scale Your Supply Chain{" "}
            <span className="text-gray-400 dark:text-gray-500">Efficiently</span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-lg text-base leading-7 text-gray-500 dark:text-gray-400">
            Choose the plan that fits your warehouses, suppliers, fleet
            workflows, and analytics needs. Built for teams that need cleaner
            operations without heavyweight implementation.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Start Free Trial <ArrowRight size={15} />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600"
            >
              Compare Plans <ChevronRight size={15} />
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          className="relative"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20">
            <div className="rounded-xl bg-gray-900 p-5 text-white dark:bg-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs text-gray-400">Operations Health</p>
                  <p className="text-lg font-bold">Live Control Center</p>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  Synced
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-white/[0.06] p-3.5"
                  >
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="mt-1.5 text-[11px] leading-4 text-gray-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom Cards */}
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr]">
                <div className="rounded-xl bg-white/[0.05] p-4">
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-gray-300">
                      <Boxes size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Inventory Flow</p>
                      <p className="text-xs text-gray-400">All warehouses</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {["Mumbai DC", "Delhi Hub", "Bengaluru Fulfillment"].map(
                      (hub, index) => (
                        <div key={hub}>
                          <div className="mb-1 flex justify-between text-[11px] text-gray-400">
                            <span>{hub}</span>
                            <span>{88 - index * 13}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10">
                            <div
                              className="h-1.5 rounded-full bg-gray-300"
                              style={{ width: `${88 - index * 13}%` }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.05] p-4">
                  <ShieldCheck className="text-emerald-400" size={22} />
                  <p className="mt-3 text-sm font-bold">Supplier SLA</p>
                  <p className="mt-1.5 text-xs leading-5 text-gray-400">
                    Track approvals, delays, roles, and supplier performance
                    from one clean workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Pricing Card ─── */
function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPlanPricing(plan, billingCycle) {
  if (!plan.monthly_price) {
    return {
      price: plan.price_label,
      period: plan.period,
      note: plan.billing_note,
    };
  }

  if (billingCycle === "yearly") {
    return {
      price: formatPrice(plan.yearly_price),
      period: "/year",
      note: `Save ${formatPrice(plan.monthly_price * 12 - plan.yearly_price)} yearly`,
    };
  }

  return {
    price: formatPrice(plan.monthly_price),
    period: "/month",
    note: "Billed monthly",
  };
}

function PricingCard({ plan, index, billingCycle }) {
  const Icon = planIcons[plan.icon_key] || Warehouse;
  const pricing = getPlanPricing(plan, billingCycle);

  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={cardMotion}
      whileHover={{ y: -6 }}
      className={`relative flex h-full flex-col rounded-2xl border p-6 transition-shadow ${
        plan.is_popular
          ? "border-gray-900 bg-gray-900 text-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
          : "border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-white"
      }`}
    >
      {plan.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-900 shadow-sm dark:bg-gray-200">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-medium ${
              plan.is_popular
                ? "text-gray-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {plan.audience}
          </p>
          <h3 className="mt-1.5 text-2xl font-bold tracking-tight">
            {plan.name}
          </h3>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            plan.is_popular
              ? "bg-white/10 text-gray-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-bold tracking-tight sm:text-4xl">
            {pricing.price}
          </span>
          <span
            className={`pb-1 text-sm ${
              plan.is_popular
                ? "text-gray-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {pricing.period}
          </span>
        </div>
        {pricing.note && (
          <p
            className={`mt-2 text-xs font-medium ${
              plan.is_popular
                ? "text-gray-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {pricing.note}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[13px] font-medium"
          >
            <span
              className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ${
                plan.is_popular
                  ? "bg-white/15 text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            <span
              className={
                plan.is_popular
                  ? "text-gray-300"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={plan.href}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
          plan.is_popular
            ? "bg-white text-gray-900 shadow-sm hover:bg-gray-100"
            : "bg-gray-900 text-white shadow-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        }`}
      >
        {plan.cta} <ArrowRight size={14} />
      </a>
    </motion.article>
  );
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        setPlansError("");
        const res = await api.get("/subscriptions/plans");

        if (isMounted) {
          setPlans(res.data);
        }
      } catch (err) {
        console.error("Failed to load subscription plans", err);
        if (isMounted) {
          setPlansError("Unable to load subscription plans.");
        }
      } finally {
        if (isMounted) {
          setLoadingPlans(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="pricing" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500"
          >
            Subscription Plans
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Free, premium, and custom plans for every stage
          </motion.h2>
          <p className="mt-4 text-base leading-7 text-gray-500 dark:text-gray-400">
            Start free with one workspace in every module, then scale warehouses,
            factories, suppliers, logistics, and employees as your team grows.
          </p>

          {/* Toggle */}
          <div className="mt-7 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800">
            {["monthly", "yearly"].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-md px-4 py-2 text-xs font-semibold capitalize transition-all ${
                  billingCycle === cycle
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {cycle}
                {cycle === "yearly" && (
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    Save 2 months
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {loadingPlans && (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[31rem] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        )}

        {!loadingPlans && plansError && (
          <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {plansError}
          </div>
        )}

        {!loadingPlans && !plansError && (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.slug}
                plan={plan}
                index={index}
                billingCycle={billingCycle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-gray-200 px-6 py-10 dark:border-gray-800 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            <Truck size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              FlowChain
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supply chain management made measurable.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-400 dark:text-gray-500">
          <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
            Security
          </a>
          <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
            Terms
          </a>
          <span>{"\u00A9"} 2026 FlowChain SCM</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page (Main Export) ─── */
export default function KorvexLanding() {
  const isDark = true;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <main>
          <HeroSection />

          {/* Feature Strip */}
          <section className="border-y border-gray-200/60 bg-gray-50/60 px-6 py-6 dark:border-gray-800/60 dark:bg-gray-900/40 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
              {[
                { icon: Zap, text: "Fast onboarding for growing teams" },
                {
                  icon: Building2,
                  text: "Warehouse, supplier, and fleet workflows",
                },
                {
                  icon: ShieldCheck,
                  text: "Enterprise-grade access and support",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-2.5 text-[13px] font-medium text-gray-500 dark:text-gray-400"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <Icon size={16} />
                    </span>
                    {item.text}
                  </div>
                );
              })}
            </div>
          </section>

          <PricingSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ─── Subscriptions / Pricing Page ─── */
export function SubscriptionsPage() {
  const isDark = true;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <main>
          {/* Page Hero */}
          <section className="relative overflow-hidden px-6 pt-14 md:pt-20 lg:px-8">
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]" />
            {/* Glow */}
            <div className="absolute left-1/2 top-0 h-60 w-[36rem] -translate-x-1/2 rounded-full bg-gray-200/40 blur-3xl dark:bg-gray-800/30" />

            <div className="relative mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Sparkles size={13} className="text-gray-400" />
                Choose your subscription
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
                className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
              >
                Pick the right plan for your operations team
              </motion.h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
                Compare Free, Starter, Premium, and Custom plans in one place,
                with clear limits for employees, warehouses, factories,
                suppliers, and logistics.
              </p>
            </div>
          </section>

          <PricingSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export function ContactSalesPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        <Navbar
          isDark={isDark}
          onThemeToggle={() => setIsDark((value) => !value)}
        />
        <main className="px-6 py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <Sparkles size={13} className="text-gray-400" />
                Custom plan
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Build a plan around your operation
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
                Tell us your warehouse, factory, supplier, logistics, business,
                and employee needs. Our team will prepare a custom subscription
                for your company.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Custom module limits",
                  "Custom employee limits",
                  "Dedicated onboarding",
                  "Priority support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <Check size={15} className="text-gray-400" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.form
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { label: "Full name", type: "text", placeholder: "Your name" },
                  { label: "Work email", type: "email", placeholder: "you@company.com" },
                  { label: "Company", type: "text", placeholder: "Company name" },
                  { label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
                ].map((field) => (
                  <label key={field.label} className="block">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-500"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  What do you need?
                </span>
                <textarea
                  rows="5"
                  placeholder="Example: 8 warehouses, 4 factories, 20 suppliers, 6 logistics teams, 5 businesses, 100 employees..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-gray-500"
                />
              </label>

              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Send Request <ArrowRight size={14} />
              </button>
            </motion.form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
