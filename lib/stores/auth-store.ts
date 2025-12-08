import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthState, UserSettings } from "@/types";

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  rsvpReminders: true,
  marketingEmails: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: "en",
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "Login failed");
          }

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "Signup failed");
          }

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshSession: async () => {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Session expired");
          }

          const data = await response.json();
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "Update failed");
          }

          set({
            user: { ...user, ...data.data },
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      updateSettings: async (settings: Partial<UserSettings>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/user/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "Update failed");
          }

          set({
            user: {
              ...user,
              settings: { ...user.settings, ...settings },
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Update failed",
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
