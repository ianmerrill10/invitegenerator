"use client";

import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="xl" />
          <p className="text-surface-500 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}
