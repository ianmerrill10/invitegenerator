"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { AccountSettings } from "@/components/dashboard/account-settings";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, UserSettings } from "@/types";

export default function SettingsPage() {
  const { user, isLoading, updateProfile, updateSettings: storeUpdateSettings } = useAuthStore();

  const handleUpdateProfile = async (data: Partial<User>) => {
    await updateProfile(data);
  };

  const handleUpdateSettings = async (settings: Partial<UserSettings>) => {
    await storeUpdateSettings(settings);
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    // Upload avatar to S3 using the upload API
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || "Failed to upload avatar");
    }

    return result.data.publicUrl;
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-center text-muted-foreground">
          Please sign in to view your settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <AccountSettings
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onUpdateSettings={handleUpdateSettings}
        onUploadAvatar={handleUploadAvatar}
      />
    </div>
  );
}
