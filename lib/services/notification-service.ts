import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationType } from "@/components/notifications/notification-item";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_NOTIFICATIONS_TABLE || "InviteGenerator-Notifications-production";

// Extended interface for DB storage
interface DBNotification extends Omit<Notification, "createdAt"> {
  userId: string;
  createdAt: string;
}

export class NotificationService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "userId-createdAt-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false, // Newest first
      });

      const result = await docClient.send(command);
      const items = (result.Items as DBNotification[]) || [];

      return items.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  static async createNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      link?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Notification | null> {
    const now = new Date();
    const notification: DBNotification = {
      id: uuidv4(),
      userId,
      ...data,
      createdAt: now.toISOString(),
      read: false,
    };

    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: notification,
        ConditionExpression: "attribute_not_exists(id)",
      });

      await docClient.send(command);
      
      return {
        ...notification,
        createdAt: now,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: notificationId,
        },
        ConditionExpression: "userId = :userId",
        UpdateExpression: "set #read = :read",
        ExpressionAttributeNames: {
          "#read": "read",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":read": true,
        },
      });

      await docClient.send(command);
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  static async markAllAsRead(userId: string, notificationIds: string[]): Promise<boolean> {
    if (notificationIds.length === 0) return true;
    
    try {
      // Process in parallel with a limit could be better, but for now Promise.all
      const updates = notificationIds.map(id => 
        this.markAsRead(userId, id)
      );
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error("Error marking all as read:", error);
      return false;
    }
  }
}
