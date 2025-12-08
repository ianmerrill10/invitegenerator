// Canva Connect API Configuration
// Documentation: https://www.canva.dev/docs/connect/

export const CANVA_CONFIG = {
  // OAuth endpoints
  authorizationEndpoint: "https://www.canva.com/api/oauth/authorize",
  tokenEndpoint: "https://www.canva.com/api/oauth/token",

  // API base URL
  apiBaseUrl: "https://api.canva.com/rest/v1",

  // Required scopes for InviteGenerator
  scopes: [
    "design:content:read",
    "design:content:write",
    "design:meta:read",
    "asset:read",
    "asset:write",
    "folder:read",
    "folder:write",
  ],

  // OAuth redirect
  redirectUri: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/canva/callback`
    : "http://localhost:3000/api/canva/callback",

  // Client credentials (set in environment)
  clientId: process.env.CANVA_CLIENT_ID || "",
  clientSecret: process.env.CANVA_CLIENT_SECRET || "",
} as const;

// Canva design dimensions that map to our invitation sizes
export const CANVA_DESIGN_TYPES = {
  invitation: {
    name: "Invitation",
    width: 800,
    height: 1120,
  },
  squareInvitation: {
    name: "Square Invitation",
    width: 800,
    height: 800,
  },
  instagramPost: {
    name: "Instagram Post",
    width: 1080,
    height: 1080,
  },
  instagramStory: {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
  },
  a5: {
    name: "A5 Document",
    width: 827,
    height: 1169,
  },
} as const;

// Canva Connect API Response Types
export interface CanvaDesign {
  id: string;
  title: string;
  owner: {
    user_id: string;
    team_id?: string;
  };
  doctype: string;
  created_at: number;
  updated_at: number;
  thumbnail?: {
    width: number;
    height: number;
    url: string;
  };
  urls: {
    edit_url: string;
    view_url: string;
  };
}

export interface CanvaAsset {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  thumbnail?: {
    width: number;
    height: number;
    url: string;
  };
  tags: string[];
}

export interface CanvaFolder {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface CanvaExportResult {
  job: {
    id: string;
    status: "in_progress" | "success" | "failed";
  };
  urls?: string[];
}

export interface CanvaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}
