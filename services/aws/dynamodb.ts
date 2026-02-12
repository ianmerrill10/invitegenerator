// ============================================
// AWS DYNAMODB SERVICE
// Database operations for all tables
// ============================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Invitation, User, RSVPResponse, Template } from '@/types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// Table names from environment
const TABLES = {
  users: process.env.DYNAMODB_USERS_TABLE || 'InviteGenerator-Users-production',
  invitations: process.env.DYNAMODB_INVITATIONS_TABLE || 'InviteGenerator-Invitations-production',
  rsvp: process.env.DYNAMODB_RSVPS_TABLE || 'InviteGenerator-RSVPs-production',
  templates: process.env.DYNAMODB_TEMPLATES_TABLE || 'InviteGenerator-Templates-production',
};

// ==================== USER OPERATIONS ====================

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.users,
      Key: { id: userId },
    });
    const result = await docClient.send(command);
    return (result.Item as User) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.users,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    });
    const result = await docClient.send(command);
    return (result.Items?.[0] as User) || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function createUser(user: User): Promise<boolean> {
  try {
    const command = new PutCommand({
      TableName: TABLES.users,
      Item: user,
      ConditionExpression: 'attribute_not_exists(id)',
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<boolean> {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) return true;

    const command = new UpdateCommand({
      TableName: TABLES.users,
      Key: { id: userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

// ==================== INVITATION OPERATIONS ====================

export async function getInvitationById(invitationId: string): Promise<Invitation | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.invitations,
      Key: { id: invitationId },
    });
    const result = await docClient.send(command);
    return (result.Item as Invitation) || null;
  } catch (error) {
    console.error('Error getting invitation:', error);
    return null;
  }
}

export async function getInvitationsByUserId(userId: string): Promise<Invitation[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.invitations,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false, // Most recent first
    });
    const result = await docClient.send(command);
    return (result.Items as Invitation[]) || [];
  } catch (error) {
    console.error('Error getting user invitations:', error);
    return [];
  }
}

export async function createInvitation(invitation: Invitation): Promise<boolean> {
  try {
    const command = new PutCommand({
      TableName: TABLES.invitations,
      Item: invitation,
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error creating invitation:', error);
    return false;
  }
}

export async function updateInvitation(
  invitationId: string,
  updates: Partial<Invitation>
): Promise<boolean> {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) return true;

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLES.invitations,
      Key: { id: invitationId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error updating invitation:', error);
    return false;
  }
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.invitations,
      Key: { id: invitationId },
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return false;
  }
}

export async function incrementInvitationViewCount(invitationId: string): Promise<boolean> {
  try {
    const command = new UpdateCommand({
      TableName: TABLES.invitations,
      Key: { id: invitationId },
      UpdateExpression: 'SET viewCount = if_not_exists(viewCount, :zero) + :inc',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':inc': 1,
      },
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
}

// ==================== RSVP OPERATIONS ====================

export async function getRSVPById(rsvpId: string): Promise<RSVPResponse | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.rsvp,
      Key: { id: rsvpId },
    });
    const result = await docClient.send(command);
    return (result.Item as RSVPResponse) || null;
  } catch (error) {
    console.error('Error getting RSVP:', error);
    return null;
  }
}

export async function getRSVPsByInvitationId(invitationId: string): Promise<RSVPResponse[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.rsvp,
      IndexName: 'invitationId-index',
      KeyConditionExpression: 'invitationId = :invitationId',
      ExpressionAttributeValues: { ':invitationId': invitationId },
    });
    const result = await docClient.send(command);
    return (result.Items as RSVPResponse[]) || [];
  } catch (error) {
    console.error('Error getting RSVPs:', error);
    return [];
  }
}

export async function createRSVP(rsvp: RSVPResponse): Promise<boolean> {
  try {
    const command = new PutCommand({
      TableName: TABLES.rsvp,
      Item: rsvp,
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return false;
  }
}

export async function updateRSVP(
  rsvpId: string,
  updates: Partial<RSVPResponse>
): Promise<boolean> {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) return true;

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLES.rsvp,
      Key: { id: rsvpId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return false;
  }
}

export async function deleteRSVP(rsvpId: string): Promise<boolean> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.rsvp,
      Key: { id: rsvpId },
    });
    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return false;
  }
}

// ==================== TEMPLATE OPERATIONS ====================

export async function getTemplateById(templateId: string): Promise<Template | null> {
  try {
    const command = new GetCommand({
      TableName: TABLES.templates,
      Key: { id: templateId },
    });
    const result = await docClient.send(command);
    return (result.Item as Template) || null;
  } catch (error) {
    console.error('Error getting template:', error);
    return null;
  }
}

export async function getTemplatesByCategory(category: string): Promise<Template[]> {
  try {
    const command = new QueryCommand({
      TableName: TABLES.templates,
      IndexName: 'category-index',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: { ':category': category },
    });
    const result = await docClient.send(command);
    return (result.Items as Template[]) || [];
  } catch (error) {
    console.error('Error getting templates by category:', error);
    return [];
  }
}

export async function getAllTemplates(): Promise<Template[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.templates,
    });
    const result = await docClient.send(command);
    return (result.Items as Template[]) || [];
  } catch (error) {
    console.error('Error getting all templates:', error);
    return [];
  }
}
