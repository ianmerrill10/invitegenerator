"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Globe,
  LogOut,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";

// Settings tabs
const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

// Plan features
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "3 invitations/month",
      "Basic templates",
      "50 guests per invitation",
      "Email support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 9,
    features: [
      "10 invitations/month",
      "All templates",
      "200 guests per invitation",
      "Priority email support",
      "Custom branding",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    features: [
      "Unlimited invitations",
      "All templates + premium",
      "Unlimited guests",
      "Priority support",
      "Custom branding",
      "API access",
      "Analytics",
    ],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Profile form state
  const [profile, setProfile] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: user?.settings?.timezone || "America/New_York",
    language: user?.settings?.language || "en",
  });

  // Notification settings
  const [notifications, setNotifications] = React.useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    rsvpReminders: user?.settings?.rsvpReminders ?? true,
    marketingEmails: user?.settings?.marketingEmails ?? false,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-600 hover:bg-surface-100"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Success Message */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700"
            >
              <Check className="h-5 w-5" />
              <span>Settings saved successfully!</span>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 rounded-lg"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 rounded-lg"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    description: "Receive email updates about your invitations",
                  },
                  {
                    key: "rsvpReminders",
                    label: "RSVP Reminders",
                    description: "Get notified when guests respond to your invitations",
                  },
                  {
                    key: "marketingEmails",
                    label: "Marketing Emails",
                    description: "Receive tips, updates, and promotions",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between py-3 border-b border-surface-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-surface-900">{setting.label}</p>
                      <p className="text-sm text-surface-500">{setting.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [setting.key]: !notifications[setting.key as keyof typeof notifications],
                        })
                      }
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors",
                        notifications[setting.key as keyof typeof notifications]
                          ? "bg-brand-500"
                          : "bg-surface-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                          notifications[setting.key as keyof typeof notifications]
                            ? "translate-x-7"
                            : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-surface-900">
                          {user?.plan === "free" ? "Free" : user?.plan === "starter" ? "Starter" : "Pro"}
                        </h3>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="text-surface-500 mt-1">
                        {user?.creditsRemaining || 0} AI credits remaining this month
                      </p>
                    </div>
                    {user?.plan === "free" && (
                      <Button variant="primary">Upgrade</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      plan.popular && "ring-2 ring-brand-500",
                      user?.plan === plan.id && "bg-brand-50"
                    )}
                  >
                    <CardContent className="p-6">
                      {plan.popular && (
                        <Badge variant="brand" className="mb-4">
                          Most Popular
                        </Badge>
                      )}
                      <h3 className="text-xl font-semibold text-surface-900">{plan.name}</h3>
                      <div className="mt-2 mb-4">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-surface-500">/month</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={user?.plan === plan.id ? "outline" : "primary"}
                        className="w-full"
                        disabled={user?.plan === plan.id}
                      >
                        {user?.plan === plan.id ? "Current Plan" : "Select Plan"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Current Password
                    </label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      New Password
                    </label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <div className="flex justify-end">
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-error-200">
                <CardHeader>
                  <CardTitle className="text-error-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">Sign Out</p>
                      <p className="text-sm text-surface-500">Sign out of your account</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => logout()}
                      leftIcon={<LogOut className="h-4 w-4" />}
                    >
                      Sign Out
                    </Button>
                  </div>
                  <hr className="border-surface-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-error-600">Delete Account</p>
                      <p className="text-sm text-surface-500">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="text-error-600 border-error-300 hover:bg-error-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
