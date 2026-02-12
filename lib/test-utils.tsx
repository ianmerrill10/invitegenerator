/**
 * Test utilities for React Testing Library
 */

import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { Toaster } from "sonner";

// Mock providers for testing
interface MockProvidersProps {
  children: ReactNode;
}

function MockProviders({ children }: MockProvidersProps) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}

// Custom render function that wraps with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return render(ui, { wrapper: MockProviders, ...options });
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render };

// Mock data generators
export function mockUser(overrides?: Partial<{
  id: string;
  email: string;
  name: string;
  avatar: string;
}>) {
  return {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    avatar: undefined,
    ...overrides,
  };
}

export function mockInvitation(overrides?: Partial<{
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  status: string;
}>) {
  return {
    id: "inv-123",
    title: "Test Invitation",
    eventType: "birthday",
    eventDate: new Date().toISOString(),
    eventTime: "18:00",
    location: {
      name: "Test Venue",
      address: "123 Test St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
      country: "USA",
      virtual: false,
    },
    description: "Test description",
    hostName: "Test Host",
    status: "draft",
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function mockTemplate(overrides?: Partial<{
  id: string;
  name: string;
  category: string;
  isPremium: boolean;
}>) {
  return {
    id: "template-123",
    name: "Test Template",
    category: "birthday",
    thumbnail: "/templates/test.jpg",
    previewImages: [],
    description: "A test template",
    tags: ["modern", "elegant"],
    isPremium: false,
    price: undefined,
    rating: 4.5,
    reviewCount: 100,
    design: {
      backgroundColor: "#FFFFFF",
      primaryColor: "#EC4899",
      secondaryColor: "#64748B",
      accentColor: "#FCD34D",
      fontFamily: "Inter",
      headingFont: "Playfair Display",
      textColor: "#1C1917",
      layout: "classic",
      width: 800,
      height: 1120,
    },
    ...overrides,
  };
}

export function mockRsvpResponse(overrides?: Partial<{
  id: string;
  name: string;
  status: string;
}>) {
  return {
    id: "rsvp-123",
    invitationId: "inv-123",
    name: "Guest Name",
    email: "guest@example.com",
    status: "attending",
    numberOfGuests: 1,
    message: "Looking forward to it!",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Wait utilities
export function waitForMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock fetch responses
export function mockFetchResponse<T>(data: T, options?: {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}): Response {
  const { status = 200, statusText = "OK", headers = {} } = options || {};

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers(headers),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: "basic" as ResponseType,
    url: "",
    bytes: async () => new Uint8Array(0),
  } as Response;
}

export function mockApiSuccess<T>(data: T) {
  return mockFetchResponse({
    success: true,
    data,
  });
}

export function mockApiError(message: string, code: string = "ERROR", status: number = 400) {
  return mockFetchResponse(
    {
      success: false,
      error: { code, message, statusCode: status },
    },
    { status }
  );
}

// Setup mock fetch globally
export function setupMockFetch<T>(response: Response | T) {
  const mockResponse = response instanceof Response
    ? response
    : mockApiSuccess(response);

  global.fetch = jest.fn(() => Promise.resolve(mockResponse)) as jest.Mock;
  return global.fetch as jest.Mock;
}

// Reset mocks helper
export function resetAllMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

// Local storage mock
export function mockLocalStorage() {
  let store: Record<string, string> = {};

  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
}

// Form event helpers
export function createChangeEvent(value: string) {
  return {
    target: { value },
    preventDefault: jest.fn(),
  };
}

export function createSubmitEvent() {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };
}
