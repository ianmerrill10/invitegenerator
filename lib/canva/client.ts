// Canva Connect API Client
// Documentation: https://www.canva.dev/docs/connect/

import {
  CANVA_CONFIG,
  CanvaDesign,
  CanvaAsset,
  CanvaFolder,
  CanvaExportResult,
  CanvaTokenResponse
} from "./config";

export class CanvaClient {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.baseUrl = CANVA_CONFIG.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new CanvaAPIError(
        error.message || `Canva API error: ${response.status}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  // ============================================
  // DESIGNS
  // ============================================

  /**
   * List user's designs
   */
  async listDesigns(options?: {
    query?: string;
    continuation?: string;
    ownership?: "owned" | "shared";
  }): Promise<{ items: CanvaDesign[]; continuation?: string }> {
    const params = new URLSearchParams();
    if (options?.query) params.set("query", options.query);
    if (options?.continuation) params.set("continuation", options.continuation);
    if (options?.ownership) params.set("ownership", options.ownership);

    return this.request(`/designs?${params.toString()}`);
  }

  /**
   * Get a specific design
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    return this.request(`/designs/${designId}`);
  }

  /**
   * Create a new design
   */
  async createDesign(options: {
    design_type?: string;
    title?: string;
    asset_id?: string;
  }): Promise<{ design: CanvaDesign }> {
    return this.request("/designs", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Export a design to image/PDF
   */
  async exportDesign(
    designId: string,
    options: {
      format: "png" | "jpg" | "pdf";
      pages?: number[];
      quality?: "regular" | "high";
    }
  ): Promise<CanvaExportResult> {
    return this.request(`/designs/${designId}/exports`, {
      method: "POST",
      body: JSON.stringify({
        format: options.format,
        pages: options.pages,
        quality: options.quality || "high",
      }),
    });
  }

  /**
   * Get export job status
   */
  async getExportJob(
    designId: string,
    jobId: string
  ): Promise<CanvaExportResult> {
    return this.request(`/designs/${designId}/exports/${jobId}`);
  }

  // ============================================
  // ASSETS
  // ============================================

  /**
   * Upload an asset to Canva
   */
  async uploadAsset(options: {
    name: string;
    mimeType: string;
    data: Blob | ArrayBuffer | Uint8Array;
    tags?: string[];
  }): Promise<{ asset: CanvaAsset; job: { id: string; status: string } }> {
    // For file uploads, we need to use multipart form data
    const formData = new FormData();
    formData.append("name", options.name);

    const blob = options.data instanceof Blob
      ? options.data
      : new Blob([options.data as BlobPart], { type: options.mimeType });
    formData.append("file", blob, options.name);

    if (options.tags) {
      options.tags.forEach(tag => formData.append("tags[]", tag));
    }

    const response = await fetch(`${this.baseUrl}/assets`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new CanvaAPIError(
        error.message || `Asset upload failed: ${response.status}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  /**
   * List user's assets
   */
  async listAssets(options?: {
    continuation?: string;
  }): Promise<{ items: CanvaAsset[]; continuation?: string }> {
    const params = new URLSearchParams();
    if (options?.continuation) params.set("continuation", options.continuation);

    return this.request(`/assets?${params.toString()}`);
  }

  /**
   * Get a specific asset
   */
  async getAsset(assetId: string): Promise<CanvaAsset> {
    return this.request(`/assets/${assetId}`);
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    await this.request(`/assets/${assetId}`, { method: "DELETE" });
  }

  // ============================================
  // FOLDERS
  // ============================================

  /**
   * List user's folders
   */
  async listFolders(options?: {
    continuation?: string;
  }): Promise<{ items: CanvaFolder[]; continuation?: string }> {
    const params = new URLSearchParams();
    if (options?.continuation) params.set("continuation", options.continuation);

    return this.request(`/folders?${params.toString()}`);
  }

  /**
   * Create a folder
   */
  async createFolder(options: {
    name: string;
    parent_folder_id?: string;
  }): Promise<{ folder: CanvaFolder }> {
    return this.request("/folders", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  // ============================================
  // USER
  // ============================================

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<{
    user: {
      id: string;
      display_name: string;
    };
    team?: {
      id: string;
      display_name: string;
    };
  }> {
    return this.request("/users/me");
  }
}

// ============================================
// OAUTH HELPERS
// ============================================

/**
 * Generate the OAuth authorization URL
 */
export function getCanvaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CANVA_CONFIG.clientId,
    redirect_uri: CANVA_CONFIG.redirectUri,
    response_type: "code",
    scope: CANVA_CONFIG.scopes.join(" "),
    state,
  });

  return `${CANVA_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<CanvaTokenResponse> {
  const response = await fetch(CANVA_CONFIG.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CANVA_CONFIG.clientId,
      client_secret: CANVA_CONFIG.clientSecret,
      code,
      redirect_uri: CANVA_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new CanvaAPIError(
      error.error_description || "Token exchange failed",
      response.status,
      error.error
    );
  }

  return response.json();
}

/**
 * Refresh an access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<CanvaTokenResponse> {
  const response = await fetch(CANVA_CONFIG.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CANVA_CONFIG.clientId,
      client_secret: CANVA_CONFIG.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new CanvaAPIError(
      error.error_description || "Token refresh failed",
      response.status,
      error.error
    );
  }

  return response.json();
}

// ============================================
// ERROR HANDLING
// ============================================

export class CanvaAPIError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "CanvaAPIError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
