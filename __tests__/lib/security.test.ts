import {
  validateURL,
  validateImageURL,
  validateAvatarURL,
  sanitizeText,
  validateEmail,
  validatePassword,
  isValidUUID,
  sanitizeFilename,
} from "@/lib/security";

describe("Security Utilities", () => {
  describe("validateURL", () => {
    it("should accept valid HTTPS URLs", () => {
      const result = validateURL("https://invitegenerator-assets.s3.amazonaws.com/image.jpg");
      expect(result.valid).toBe(true);
      expect(result.sanitizedUrl).toBeDefined();
    });

    it("should reject HTTP URLs when requireHttps is true", () => {
      const result = validateURL("http://example.com/image.jpg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("HTTPS");
    });

    it("should reject javascript: protocol", () => {
      const result = validateURL("javascript:alert('xss')");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Forbidden");
    });

    it("should reject data: protocol", () => {
      const result = validateURL("data:text/html,<script>alert('xss')</script>");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Forbidden");
    });

    it("should reject localhost URLs", () => {
      const result = validateURL("https://localhost/image.jpg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Internal");
    });

    it("should reject private IP addresses", () => {
      const privateIPs = [
        "https://127.0.0.1/image.jpg",
        "https://192.168.1.1/image.jpg",
        "https://10.0.0.1/image.jpg",
        "https://172.16.0.1/image.jpg",
      ];

      privateIPs.forEach((url) => {
        const result = validateURL(url);
        expect(result.valid).toBe(false);
      });
    });

    it("should reject URLs that are too long", () => {
      const longUrl = "https://example.com/" + "a".repeat(2100);
      const result = validateURL(longUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("long");
    });

    it("should reject domains not in allowed list", () => {
      const result = validateURL("https://malicious-site.com/image.jpg");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("not in the allowed list");
    });
  });

  describe("validateImageURL", () => {
    it("should accept valid S3 image URLs", () => {
      const result = validateImageURL("https://invitegenerator-assets.s3.amazonaws.com/images/photo.jpg");
      expect(result.valid).toBe(true);
    });

    it("should accept valid Unsplash URLs", () => {
      const result = validateImageURL("https://images.unsplash.com/photo-123456789");
      expect(result.valid).toBe(true);
    });
  });

  describe("validateAvatarURL", () => {
    it("should accept empty URLs (for clearing avatar)", () => {
      const result = validateAvatarURL("");
      expect(result.valid).toBe(true);
      expect(result.sanitizedUrl).toBe("");
    });

    it("should accept valid avatar URLs", () => {
      const result = validateAvatarURL("https://invitegenerator-assets.s3.amazonaws.com/avatars/user.jpg");
      expect(result.valid).toBe(true);
    });
  });

  describe("sanitizeText", () => {
    it("should escape HTML special characters", () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeText(input);
      expect(output).not.toContain("<script>");
      expect(output).toContain("&lt;script&gt;");
    });

    it("should escape quotes", () => {
      const input = 'He said "hello" and \'goodbye\'';
      const output = sanitizeText(input);
      expect(output).toContain("&quot;");
      expect(output).toContain("&#x27;");
    });

    it("should escape ampersands", () => {
      const input = "Tom & Jerry";
      const output = sanitizeText(input);
      expect(output).toContain("&amp;");
    });

    it("should truncate to max length", () => {
      const input = "a".repeat(2000);
      const output = sanitizeText(input, 100);
      expect(output.length).toBe(100);
    });

    it("should handle empty input", () => {
      expect(sanitizeText("")).toBe("");
      expect(sanitizeText(null as unknown as string)).toBe("");
    });
  });

  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "not-an-email",
        "@example.com",
        "user@",
        "user@.com",
        "",
        "user@example",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it("should reject overly long emails", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept strong passwords", () => {
      const result = validatePassword("StrongP@ssw0rd!");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject passwords that are too short", () => {
      const result = validatePassword("Short1!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("should require lowercase letters", () => {
      const result = validatePassword("NOLOWERCASE1!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain a lowercase letter");
    });

    it("should require uppercase letters", () => {
      const result = validatePassword("nouppercase1!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain an uppercase letter");
    });

    it("should require numbers", () => {
      const result = validatePassword("NoNumbers!!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain a number");
    });

    it("should require special characters", () => {
      const result = validatePassword("NoSpecial123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain a special character");
    });
  });

  describe("isValidUUID", () => {
    it("should accept valid UUIDs", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      ];

      validUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      });
    });

    it("should reject invalid UUIDs", () => {
      const invalidUUIDs = [
        "not-a-uuid",
        "550e8400-e29b-41d4-a716",
        "550e8400e29b41d4a716446655440000",
        "",
        "550e8400-e29b-01d4-a716-446655440000", // invalid version
      ];

      invalidUUIDs.forEach((uuid) => {
        expect(isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe("sanitizeFilename", () => {
    it("should remove unsafe characters", () => {
      const input = "../../../etc/passwd";
      const output = sanitizeFilename(input);
      expect(output).not.toContain("/");
      expect(output).not.toContain("..");
    });

    it("should preserve safe characters", () => {
      const input = "my-file_name.jpg";
      const output = sanitizeFilename(input);
      expect(output).toBe("my-file_name.jpg");
    });

    it("should handle empty input", () => {
      expect(sanitizeFilename("")).toBe("file");
    });

    it("should truncate long filenames", () => {
      const input = "a".repeat(300) + ".jpg";
      const output = sanitizeFilename(input);
      expect(output.length).toBeLessThanOrEqual(255);
    });

    it("should remove consecutive dots", () => {
      const input = "file...name.jpg";
      const output = sanitizeFilename(input);
      expect(output).not.toContain("..");
    });
  });
});
