"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { TemplateGallery } from "@/components/templates";
import { useInvitationStore } from "@/lib/stores";
import type { Template, EventType } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createInvitation, isLoading } = useInvitationStore();

  const [isCreating, setIsCreating] = React.useState(false);

  // Get optional category filter from query params
  const categoryParam = searchParams.get("category") as EventType | null;

  const handleSelectTemplate = async (template: Template) => {
    setIsCreating(true);
    try {
      // Check if we have wizard data from the create flow
      let wizardData = null;
      try {
        const stored = sessionStorage.getItem("createWizardData");
        if (stored) {
          wizardData = JSON.parse(stored);
          sessionStorage.removeItem("createWizardData"); // Clear after use
        }
      } catch (e) {
        // Ignore sessionStorage errors
      }

      // Create invitation with template and any stored wizard data
      const invitation = await createInvitation({
        title: wizardData?.title || `${template.name} Invitation`,
        eventType: wizardData?.eventType || template.category,
        eventDate: wizardData?.eventDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        eventTime: wizardData?.eventTime || "",
        hostName: wizardData?.hostName || "",
        location: wizardData?.location || {
          name: "",
          address: "",
        },
        description: wizardData?.description || "",
        templateId: template.id,
      });

      toast.success("Template applied! Customize your invitation.");
      router.push(`/dashboard/invitations/${invitation.id}/edit`);
    } catch (error) {
      toast.error("Failed to apply template. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Gallery"
        description="Browse our collection of professionally designed invitation templates"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Templates" },
        ]}
        actions={
          <Button onClick={() => router.push("/dashboard/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
        }
      />

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            <span>Applying template...</span>
          </div>
        </div>
      )}

      <TemplateGallery
        onSelectTemplate={handleSelectTemplate}
        filterCategory={categoryParam || undefined}
        showFilters={true}
        showSearch={true}
        columns={3}
      />
    </div>
  );
}
