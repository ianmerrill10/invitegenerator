import { create } from "zustand";
import type { Invitation, CreateInvitationFormData, RSVPResponse, RSVPSummary } from "@/types";

interface InvitationStore {
  // State
  invitations: Invitation[];
  currentInvitation: Invitation | null;
  rsvpResponses: RSVPResponse[];
  rsvpSummary: RSVPSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInvitations: () => Promise<void>;
  fetchInvitation: (id: string) => Promise<void>;
  createInvitation: (data: CreateInvitationFormData) => Promise<Invitation>;
  updateInvitation: (id: string, updates: Partial<Invitation>) => Promise<void>;
  deleteInvitation: (id: string) => Promise<void>;
  duplicateInvitation: (id: string) => Promise<Invitation>;
  publishInvitation: (id: string) => Promise<void>;
  unpublishInvitation: (id: string) => Promise<void>;
  
  // RSVP Actions
  fetchRSVPResponses: (invitationId: string) => Promise<void>;
  exportRSVPResponses: (invitationId: string, format: "csv" | "xlsx") => Promise<void>;
  
  // Local state updates
  setCurrentInvitation: (invitation: Invitation | null) => void;
  clearError: () => void;
}

export const useInvitationStore = create<InvitationStore>((set, get) => ({
  // Initial state
  invitations: [],
  currentInvitation: null,
  rsvpResponses: [],
  rsvpSummary: null,
  isLoading: false,
  error: null,

  // Actions
  fetchInvitations: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/invitations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch invitations");
      }

      set({ invitations: data.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch invitations",
        isLoading: false,
      });
    }
  },

  fetchInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/invitations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch invitation");
      }

      set({ currentInvitation: data.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch invitation",
        isLoading: false,
      });
    }
  },

  createInvitation: async (formData: CreateInvitationFormData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create invitation");
      }

      const newInvitation = data.data;
      set((state) => ({
        invitations: [newInvitation, ...state.invitations],
        currentInvitation: newInvitation,
        isLoading: false,
      }));

      return newInvitation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create invitation",
        isLoading: false,
      });
      throw error;
    }
  },

  updateInvitation: async (id: string, updates: Partial<Invitation>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update invitation");
      }

      const updatedInvitation = data.data;
      set((state) => ({
        invitations: state.invitations.map((inv) =>
          inv.id === id ? updatedInvitation : inv
        ),
        currentInvitation:
          state.currentInvitation?.id === id
            ? updatedInvitation
            : state.currentInvitation,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update invitation",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to delete invitation");
      }

      set((state) => ({
        invitations: state.invitations.filter((inv) => inv.id !== id),
        currentInvitation:
          state.currentInvitation?.id === id ? null : state.currentInvitation,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete invitation",
        isLoading: false,
      });
      throw error;
    }
  },

  duplicateInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/invitations/${id}/duplicate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to duplicate invitation");
      }

      const newInvitation = data.data;
      set((state) => ({
        invitations: [newInvitation, ...state.invitations],
        isLoading: false,
      }));

      return newInvitation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to duplicate invitation",
        isLoading: false,
      });
      throw error;
    }
  },

  publishInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/invitations/${id}/publish`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to publish invitation");
      }

      const updatedInvitation = data.data;
      set((state) => ({
        invitations: state.invitations.map((inv) =>
          inv.id === id ? updatedInvitation : inv
        ),
        currentInvitation:
          state.currentInvitation?.id === id
            ? updatedInvitation
            : state.currentInvitation,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to publish invitation",
        isLoading: false,
      });
      throw error;
    }
  },

  unpublishInvitation: async (id: string) => {
    await get().updateInvitation(id, { status: "draft" });
  },

  fetchRSVPResponses: async (invitationId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/rsvp/${invitationId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch RSVP responses");
      }

      set({
        rsvpResponses: data.data.responses,
        rsvpSummary: data.data.summary,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch RSVP responses",
        isLoading: false,
      });
    }
  },

  exportRSVPResponses: async (invitationId: string, format: "csv" | "xlsx") => {
    try {
      const response = await fetch(
        `/api/rsvp/${invitationId}/export?format=${format}`
      );

      if (!response.ok) {
        throw new Error("Failed to export RSVP responses");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rsvp-responses-${invitationId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to export RSVP responses",
      });
      throw error;
    }
  },

  setCurrentInvitation: (invitation) => set({ currentInvitation: invitation }),

  clearError: () => set({ error: null }),
}));
