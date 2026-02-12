/**
 * Template Protection Utilities
 *
 * Implements multiple layers of protection against template theft:
 * 1. Watermarking (visible and invisible)
 * 2. Right-click/save prevention
 * 3. Canvas rendering for display
 * 4. Hotlink prevention headers
 * 5. Rate limiting
 */

// Configuration
export const TEMPLATE_PROTECTION_CONFIG = {
  // Watermark settings
  watermark: {
    enabled: true,
    text: 'InviteGenerator.com',
    opacity: 0.15,
    fontSize: 14,
    rotation: -30,
    spacing: 150,
  },

  // Anti-theft settings
  preventRightClick: true,
  preventDragDrop: true,
  preventKeyboardSave: true,

  // Rate limiting
  maxRequestsPerMinute: 30,
  maxDownloadsPerDay: 10,

  // Canvas rendering (prevents direct image download)
  useCanvasRendering: true,
};

/**
 * Generate a watermarked version of an image URL
 * Uses a serverless function to add watermark on-the-fly
 */
export function getWatermarkedUrl(originalUrl: string, userId?: string): string {
  const params = new URLSearchParams({
    url: originalUrl,
    wm: 'true',
    ...(userId && { uid: userId }),
    t: Date.now().toString(), // Prevent caching
  });

  return `/api/templates/protected?${params.toString()}`;
}

/**
 * Generate presigned URL with short expiry for template access
 */
export function getProtectedTemplateUrl(
  templateId: string,
  type: 'full' | 'thumb' = 'thumb',
  expiryMinutes: number = 5
): string {
  const params = new URLSearchParams({
    id: templateId,
    type,
    exp: (Date.now() + expiryMinutes * 60 * 1000).toString(),
  });

  return `/api/templates/secure?${params.toString()}`;
}

/**
 * Client-side protection script to inject into pages
 */
export const ANTI_THEFT_SCRIPT = `
(function() {
  'use strict';

  // Disable right-click on protected images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.classList.contains('protected-template')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable drag and drop on protected images
  document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('protected-template')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts for saving
  document.addEventListener('keydown', function(e) {
    // Ctrl+S, Ctrl+Shift+S, Cmd+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.closest('.template-viewer')) {
        e.preventDefault();
        return false;
      }
    }
    // Print screen disabled for template areas
    if (e.key === 'PrintScreen') {
      const templateViewer = document.querySelector('.template-viewer:hover');
      if (templateViewer) {
        e.preventDefault();
        alert('Screenshots are disabled for template protection.');
        return false;
      }
    }
  });

  // Detect and warn about developer tools
  let devToolsOpen = false;
  const threshold = 160;

  setInterval(function() {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.log('%cTemplate Protection Active', 'color: red; font-size: 20px; font-weight: bold;');
        console.log('%cTemplates are protected intellectual property of InviteGenerator.com', 'color: gray;');
      }
    } else {
      devToolsOpen = false;
    }
  }, 1000);

  // Apply blur on inspector hover (basic protection)
  let blurEnabled = false;
  new MutationObserver(function() {
    const selected = document.querySelector(':hover');
    if (selected && selected.classList.contains('protected-template') && devToolsOpen) {
      if (!blurEnabled) {
        selected.style.filter = 'blur(10px)';
        blurEnabled = true;
      }
    }
  }).observe(document, { subtree: true, childList: true });
})();
`;

/**
 * CSS for template protection
 */
export const PROTECTION_CSS = `
.protected-template {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: auto;
}

.protected-template::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.template-viewer {
  position: relative;
  overflow: hidden;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    -30deg,
    transparent,
    transparent 100px,
    rgba(255,255,255,0.02) 100px,
    rgba(255,255,255,0.02) 200px
  );
}

.watermark-text {
  position: absolute;
  color: rgba(0,0,0,0.05);
  font-size: 12px;
  font-family: Arial, sans-serif;
  transform: rotate(-30deg);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

@media print {
  .protected-template {
    display: none !important;
  }
  .template-viewer::after {
    content: 'Printing disabled for template protection';
    display: block;
    font-size: 24px;
    text-align: center;
    padding: 100px;
  }
}
`;

/**
 * Add invisible metadata to track template usage
 */
export function generateInvisibleWatermark(templateId: string, userId?: string): string {
  const data = {
    id: templateId,
    ts: Date.now(),
    src: 'invitegenerator.com',
    ...(userId && { u: userId }),
  };

  // Encode as base64 for embedding in image metadata
  return btoa(JSON.stringify(data));
}

/**
 * Headers to prevent hotlinking
 */
export const HOTLINK_PREVENTION_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Content-Security-Policy': "default-src 'self'",
};

/**
 * Check if request is from an allowed origin
 */
export function isAllowedOrigin(referer: string | null, host: string | null): boolean {
  const allowedDomains = [
    'invitegenerator.com',
    'www.invitegenerator.com',
    'localhost',
    '127.0.0.1',
  ];

  if (!referer) return false;

  try {
    const url = new URL(referer);
    return allowedDomains.some(domain =>
      url.hostname === domain ||
      url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Rate limit tracking (use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 30): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Generate a signed token for template access
 */
export function generateAccessToken(templateId: string, userId?: string): string {
  const payload = {
    tid: templateId,
    uid: userId || 'anonymous',
    exp: Date.now() + 5 * 60 * 1000, // 5 min expiry
    nonce: Math.random().toString(36).substring(7),
  };

  // In production, use proper JWT signing with secret
  return btoa(JSON.stringify(payload));
}

/**
 * Validate access token
 */
export function validateAccessToken(token: string): { valid: boolean; templateId?: string } {
  try {
    const payload = JSON.parse(atob(token));

    if (payload.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, templateId: payload.tid };
  } catch {
    return { valid: false };
  }
}
