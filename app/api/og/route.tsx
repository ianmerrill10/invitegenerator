import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic params
    const title = searchParams.get("title") || "Create Beautiful Invitations";
    const subtitle = searchParams.get("subtitle") || "AI-powered invitation generator for any event";
    const type = searchParams.get("type") || "default"; // default, invitation, template

    // Define colors
    const brandGradient = "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)";
    const bgColor = "#FAFAF9";

    // Base styles
    const baseStyles = {
      display: "flex",
      width: "100%",
      height: "100%",
      padding: "60px",
    };

    if (type === "invitation") {
      // Invitation-specific OG image
      return new ImageResponse(
        (
          <div
            style={{
              ...baseStyles,
              background: bgColor,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top Section */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: brandGradient,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "32px" }}>✉️</span>
              </div>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#8B5CF6",
                }}
              >
                InviteGenerator
              </span>
            </div>

            {/* Main Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h1
                style={{
                  fontSize: "64px",
                  fontWeight: 800,
                  color: "#1C1917",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: "28px",
                  color: "#57534E",
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: brandGradient,
                  padding: "16px 32px",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: 600,
                }}
              >
                View Invitation →
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    if (type === "template") {
      // Template-specific OG image
      return new ImageResponse(
        (
          <div
            style={{
              ...baseStyles,
              background: `linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)`,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#8B5CF6",
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                }}
              >
                Template
              </div>
              <h1
                style={{
                  fontSize: "72px",
                  fontWeight: 800,
                  color: "#1C1917",
                  lineHeight: 1.1,
                  margin: 0,
                  maxWidth: "900px",
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: "28px",
                  color: "#57534E",
                  margin: 0,
                  maxWidth: "700px",
                }}
              >
                {subtitle}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <span style={{ fontSize: "20px", color: "#8B5CF6" }}>
                  invitegenerator.com
                </span>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Default OG image
    return new ImageResponse(
      (
        <div
          style={{
            ...baseStyles,
            background: brandGradient,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "white",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "32px" }}>✉️</span>
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "white",
              }}
            >
              InviteGenerator
            </span>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.1,
                margin: 0,
                maxWidth: "900px",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                maxWidth: "700px",
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "16px 32px",
                borderRadius: "12px",
                color: "#8B5CF6",
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Create Free Invitation
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {["⭐", "⭐", "⭐", "⭐", "⭐"].map((star, i) => (
                <span key={i} style={{ fontSize: "24px" }}>
                  {star}
                </span>
              ))}
              <span style={{ color: "white", fontSize: "20px", marginLeft: "8px" }}>
                4.9/5 Rating
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
