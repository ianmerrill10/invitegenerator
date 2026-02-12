"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Mail,
  UserPlus,
  Eye,
  CheckCircle,
} from "lucide-react";

interface AdminStats {
  totalContacts: number;
  activeAffiliates: number;
  totalTemplates: number;
  monthlyRevenue: number;
  emailsSent: number;
  newSignups: number;
  pageViews: number;
  conversions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalContacts: 0,
    activeAffiliates: 0,
    totalTemplates: 0,
    monthlyRevenue: 0,
    emailsSent: 0,
    newSignups: 0,
    pageViews: 0,
    conversions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats
    const fetchStats = async () => {
      try {
        // In production, these would be real API calls
        setStats({
          totalContacts: 247,
          activeAffiliates: 34,
          totalTemplates: 156,
          monthlyRevenue: 12450,
          emailsSent: 1893,
          newSignups: 89,
          pageViews: 45230,
          conversions: 127,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Affiliates",
      value: stats.activeAffiliates,
      icon: UserPlus,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      title: "Templates",
      value: stats.totalTemplates,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      title: "Emails Sent",
      value: stats.emailsSent,
      icon: Mail,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "New Signups",
      value: stats.newSignups,
      icon: TrendingUp,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Page Views",
      value: stats.pageViews.toLocaleString(),
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Conversions",
      value: stats.conversions,
      icon: CheckCircle,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of InviteGenerator performance and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manage Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, and track vendor contacts and partnerships
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Template Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create, edit, and organize invitation templates
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and send email marketing campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New affiliate signup", user: "sarah@weddings.com", time: "2 mins ago" },
              { action: "Contact updated", user: "Elegant Events Venue", time: "15 mins ago" },
              { action: "Template published", user: "Floral Garden Wedding", time: "1 hour ago" },
              { action: "New partnership", user: "Premier Photography", time: "3 hours ago" },
              { action: "Campaign sent", user: "Holiday Special Email", time: "5 hours ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
