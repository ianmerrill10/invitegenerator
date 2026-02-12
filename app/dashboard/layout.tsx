"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Mail,
  Plus,
  Layout,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Sparkles,
  CreditCard,
  HelpCircle,
  User,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Badge import removed - not currently used
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";
import { APP_CONFIG } from "@/lib/constants";
import { NotificationCenter } from "@/components/notifications";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Invitations",
    href: "/dashboard/invitations",
    icon: Mail,
  },
  {
    title: "Create New",
    href: "/dashboard/create",
    icon: Plus,
    highlight: true,
  },
  {
    title: "Templates",
    href: "/dashboard/templates",
    icon: Layout,
  },
  {
    title: "RSVP Tracker",
    href: "/dashboard/rsvp",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <p className="text-surface-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-surface-200">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-surface-900">
                {APP_CONFIG.name}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-medium text-sm transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : item.highlight
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                  {item.highlight && !isActive && (
                    <Sparkles className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade banner (for free users) */}
          {user?.plan === "free" && (
            <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5" />
                <span className="font-heading font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Unlock unlimited invitations and premium features
              </p>
              <Link href="/dashboard/settings?tab=billing">
                <Button
                  size="sm"
                  className="w-full bg-white text-brand-600 hover:bg-surface-100"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          )}

          {/* User section */}
          <div className="p-4 border-t border-surface-200">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-surface-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-xl border-b border-surface-200">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search invitations..."
                  className="w-full h-11 pl-12 pr-4 rounded-xl border border-surface-200 bg-surface-50 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* AI Credits badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 text-brand-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user?.creditsRemaining || 0} AI Credits
                </span>
              </div>

              {/* Notifications */}
              <NotificationCenter
                notifications={[]}
                onSettingsClick={() => router.push("/dashboard/settings?tab=notifications")}
              />

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-100 transition-colors"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen ? "true" : "false"}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-surface-500" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-surface-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-surface-200">
                          <p className="font-medium text-surface-900">
                            {user?.name}
                          </p>
                          <p className="text-sm text-surface-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile Settings
                          </Link>
                          <Link
                            href="/dashboard/settings?tab=billing"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Billing
                          </Link>
                          <Link
                            href="/help"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-surface-600 hover:bg-surface-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <HelpCircle className="h-4 w-4" />
                            Help Center
                          </Link>
                        </div>

                        <div className="border-t border-surface-200 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
