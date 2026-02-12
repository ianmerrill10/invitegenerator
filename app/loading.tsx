"use client";

import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-surface-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
