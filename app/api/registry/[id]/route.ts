import { NextRequest, NextResponse } from "next/server";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { verifyAuth } from "@/lib/auth-server";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const REGISTRY_TABLE =
  process.env.DYNAMODB_REGISTRY_TABLE || "InviteGenerator-Registry-production";

// Helper to create error response
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "REGISTRY_ERROR", message },
    },
    { status }
  );
}

// Helper to sanitize strings
function sanitizeString(str: string): string {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
    .slice(0, 10000);
}

// GET /api/registry/[id] - Get a specific registry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Validate registry ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return errorResponse("Invalid registry ID");
    }

    // Fetch registry
    const getCommand = new GetItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id }),
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      return errorResponse("Registry not found", 404);
    }

    const registry = unmarshall(result.Item);

    // Verify ownership
    if (registry.userId !== auth.userId) {
      return errorResponse(
        "You do not have permission to view this registry",
        403
      );
    }

    return NextResponse.json({
      success: true,
      data: registry,
    });
  } catch (error) {
    console.error("Error fetching registry:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/registry/[id] - Update a registry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Validate registry ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return errorResponse("Invalid registry ID");
    }

    // Fetch existing registry
    const getCommand = new GetItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id }),
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      return errorResponse("Registry not found", 404);
    }

    const existingRegistry = unmarshall(result.Item);

    // Verify ownership
    if (existingRegistry.userId !== auth.userId) {
      return errorResponse(
        "You do not have permission to update this registry",
        403
      );
    }

    // Parse update data
    const body = await request.json();

    // Allowed fields for update
    const allowedFields = [
      "title",
      "description",
      "personalMessage",
      "coverImageUrl",
      "type",
      "settings",
      "items",
      "customUrl",
      "isActive",
      "expiresAt",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === "string") {
          updates[field] = sanitizeString(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("No valid fields to update");
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    // Build update expression
    const updateExpression =
      "SET " +
      Object.keys(updates)
        .map((key, i) => `#field${i} = :value${i}`)
        .join(", ");

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.keys(updates).forEach((key, i) => {
      expressionAttributeNames[`#field${i}`] = key;
      expressionAttributeValues[`:value${i}`] = updates[key];
    });

    const updateCommand = new UpdateItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: "ALL_NEW",
    });

    const updateResult = await dynamodb.send(updateCommand);
    const updatedRegistry = updateResult.Attributes
      ? unmarshall(updateResult.Attributes)
      : null;

    return NextResponse.json({
      success: true,
      data: updatedRegistry,
    });
  } catch (error) {
    console.error("Error updating registry:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/registry/[id] - Delete a registry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify authentication
    const auth = (await verifyAuth(request)) as {
      authenticated: boolean;
      userId: string | null;
    };
    if (!auth.authenticated || !auth.userId) {
      return errorResponse("Unauthorized", 401);
    }

    // Validate registry ID
    if (!id || !/^[a-zA-Z0-9-]{36}$/.test(id)) {
      return errorResponse("Invalid registry ID");
    }

    // Fetch existing registry
    const getCommand = new GetItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id }),
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      return errorResponse("Registry not found", 404);
    }

    const existingRegistry = unmarshall(result.Item);

    // Verify ownership
    if (existingRegistry.userId !== auth.userId) {
      return errorResponse(
        "You do not have permission to delete this registry",
        403
      );
    }

    // Delete the registry
    const deleteCommand = new DeleteItemCommand({
      TableName: REGISTRY_TABLE,
      Key: marshall({ id }),
    });

    await dynamodb.send(deleteCommand);

    return NextResponse.json({
      success: true,
      data: { message: "Registry deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting registry:", error);
    return errorResponse("Internal server error", 500);
  }
}
