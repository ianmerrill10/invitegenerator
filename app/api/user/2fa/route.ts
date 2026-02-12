import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { setupTwoFactor, verifyTotp, verifyBackupCode, hashBackupCode } from "@/lib/2fa";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";

// GET /api/user/2fa - Get 2FA status
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const result = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        ProjectionExpression: "twoFactorEnabled, twoFactorSetupAt",
      })
    );

    if (!result.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const user = unmarshall(result.Item);

    return NextResponse.json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled || false,
        setupAt: user.twoFactorSetupAt || null,
      },
    });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch 2FA status" } },
      { status: 500 }
    );
  }
}

// POST /api/user/2fa - Setup 2FA (generate secret)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Get user
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
      })
    );

    if (!userResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const user = unmarshall(userResult.Item);

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_ENABLED", message: "2FA is already enabled" } },
        { status: 400 }
      );
    }

    // Generate 2FA setup
    const setup = setupTwoFactor(user.email);

    // Store pending setup (not enabled yet)
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        UpdateExpression: "SET twoFactorPendingSecret = :secret, twoFactorPendingBackupCodes = :codes, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":secret": setup.secret,
          ":codes": setup.hashedBackupCodes,
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        qrCodeUri: setup.uri,
        secret: setup.secret, // For manual entry
        backupCodes: setup.backupCodes, // Show once, user must save
      },
    });
  } catch (error) {
    console.error("Setup 2FA error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SETUP_FAILED", message: "Failed to setup 2FA" } },
      { status: 500 }
    );
  }
}

// PUT /api/user/2fa - Verify and enable 2FA
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CODE", message: "Verification code required" } },
        { status: 400 }
      );
    }

    // Get user with pending setup
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
      })
    );

    if (!userResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const user = unmarshall(userResult.Item);

    if (!user.twoFactorPendingSecret) {
      return NextResponse.json(
        { success: false, error: { code: "NO_PENDING_SETUP", message: "No pending 2FA setup found" } },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verifyTotp(user.twoFactorPendingSecret, code);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CODE", message: "Invalid verification code" } },
        { status: 400 }
      );
    }

    // Enable 2FA
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        UpdateExpression: `
          SET twoFactorEnabled = :enabled,
              twoFactorSecret = :secret,
              twoFactorBackupCodes = :codes,
              twoFactorSetupAt = :setupAt,
              updatedAt = :updatedAt
          REMOVE twoFactorPendingSecret, twoFactorPendingBackupCodes
        `,
        ExpressionAttributeValues: marshall({
          ":enabled": true,
          ":secret": user.twoFactorPendingSecret,
          ":codes": user.twoFactorPendingBackupCodes,
          ":setupAt": new Date().toISOString(),
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Two-factor authentication enabled successfully",
      },
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return NextResponse.json(
      { success: false, error: { code: "ENABLE_FAILED", message: "Failed to enable 2FA" } },
      { status: 500 }
    );
  }
}

// DELETE /api/user/2fa - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, backupCode } = body;

    // Get user
    const userResult = await dynamodb.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
      })
    );

    if (!userResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const user = unmarshall(userResult.Item);

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_ENABLED", message: "2FA is not enabled" } },
        { status: 400 }
      );
    }

    // Verify with TOTP or backup code
    let verified = false;

    if (code) {
      verified = verifyTotp(user.twoFactorSecret, code);
    } else if (backupCode) {
      const backupIndex = verifyBackupCode(backupCode, user.twoFactorBackupCodes || []);
      verified = backupIndex !== -1;
    }

    if (!verified) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CODE", message: "Invalid verification code" } },
        { status: 400 }
      );
    }

    // Disable 2FA
    await dynamodb.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ id: auth.userId }),
        UpdateExpression: `
          SET twoFactorEnabled = :enabled, updatedAt = :updatedAt
          REMOVE twoFactorSecret, twoFactorBackupCodes, twoFactorSetupAt
        `,
        ExpressionAttributeValues: marshall({
          ":enabled": false,
          ":updatedAt": new Date().toISOString(),
        }),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Two-factor authentication disabled",
      },
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json(
      { success: false, error: { code: "DISABLE_FAILED", message: "Failed to disable 2FA" } },
      { status: 500 }
    );
  }
}
