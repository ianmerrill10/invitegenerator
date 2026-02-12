// Google Analytics gtag type declarations
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "consent" | "set" | "js",
      targetIdOrAction: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export {};
