import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  VendorContact,
  ContactsFilter,
  ContactsStats,
  OutreachRecord,
  VendorCategory,
  ContactStatus,
  PartnershipStatus,
} from "@/types";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_CONTACTS_TABLE || "InviteGenerator-Contacts-production";

// Category display names and icons
export const VENDOR_CATEGORIES: Record<VendorCategory, { label: string; icon: string }> = {
  venue: { label: "Wedding Venues", icon: "🏰" },
  dj: { label: "DJs & Entertainment", icon: "🎧" },
  musician: { label: "Musicians & Singers", icon: "🎵" },
  photographer: { label: "Photographers", icon: "📷" },
  videographer: { label: "Videographers", icon: "🎬" },
  planner: { label: "Wedding Planners", icon: "📋" },
  caterer: { label: "Caterers", icon: "🍽️" },
  florist: { label: "Florists", icon: "💐" },
  beauty: { label: "Hair & Makeup", icon: "💄" },
  rentals: { label: "Rentals & Decor", icon: "🪑" },
  stationery: { label: "Stationery & Invitations", icon: "✉️" },
  bakery: { label: "Cakes & Desserts", icon: "🎂" },
  officiant: { label: "Officiants", icon: "💒" },
  transportation: { label: "Transportation", icon: "🚗" },
  other: { label: "Other", icon: "📦" },
};

// Status display names and colors
export const CONTACT_STATUSES: Record<ContactStatus, { label: string; color: string }> = {
  new: { label: "New", color: "blue" },
  contacted: { label: "Contacted", color: "yellow" },
  responded: { label: "Responded", color: "cyan" },
  meeting_scheduled: { label: "Meeting Scheduled", color: "purple" },
  negotiating: { label: "Negotiating", color: "orange" },
  converted: { label: "Converted", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  unresponsive: { label: "Unresponsive", color: "gray" },
  do_not_contact: { label: "Do Not Contact", color: "slate" },
};

// Partnership status display
export const PARTNERSHIP_STATUSES: Record<PartnershipStatus, { label: string; color: string }> = {
  none: { label: "None", color: "gray" },
  prospect: { label: "Prospect", color: "blue" },
  affiliate: { label: "Affiliate", color: "green" },
  advertiser: { label: "Advertiser", color: "purple" },
  referral_partner: { label: "Referral Partner", color: "cyan" },
  integration_partner: { label: "Integration Partner", color: "orange" },
  sponsor: { label: "Sponsor", color: "yellow" },
};

export class ContactsService {
  // Create a new contact
  static async createContact(contact: Omit<VendorContact, "id" | "createdAt" | "updatedAt">): Promise<VendorContact> {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newContact: VendorContact = {
      ...contact,
      id,
      createdAt: now,
      updatedAt: now,
      outreachHistory: contact.outreachHistory || [],
      tags: contact.tags || [],
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `CONTACT#${id}`,
          SK: `CONTACT#${id}`,
          GSI1PK: `CATEGORY#${contact.category}`,
          GSI1SK: `STATUS#${contact.status}#${now}`,
          ...newContact,
        },
      })
    );

    return newContact;
  }

  // Get a contact by ID
  static async getContact(id: string): Promise<VendorContact | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `CONTACT#${id}`,
          SK: `CONTACT#${id}`,
        },
      })
    );

    if (!result.Item) return null;

    const { PK, SK, GSI1PK, GSI1SK, ...contact } = result.Item;
    return contact as VendorContact;
  }

  // Update a contact
  static async updateContact(id: string, updates: Partial<VendorContact>): Promise<VendorContact | null> {
    const existing = await this.getContact(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedContact = {
      ...existing,
      ...updates,
      id,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `CONTACT#${id}`,
          SK: `CONTACT#${id}`,
          GSI1PK: `CATEGORY#${updatedContact.category}`,
          GSI1SK: `STATUS#${updatedContact.status}#${now}`,
          ...updatedContact,
        },
      })
    );

    return updatedContact;
  }

  // Delete a contact
  static async deleteContact(id: string): Promise<boolean> {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `CONTACT#${id}`,
          SK: `CONTACT#${id}`,
        },
      })
    );
    return true;
  }

  // List all contacts with optional filtering
  static async listContacts(filter?: ContactsFilter): Promise<VendorContact[]> {
    let result;

    if (filter?.category) {
      // Query by category using GSI
      result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :pk",
          ExpressionAttributeValues: {
            ":pk": `CATEGORY#${filter.category}`,
          },
        })
      );
    } else {
      // Scan all contacts
      result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "begins_with(PK, :prefix)",
          ExpressionAttributeValues: {
            ":prefix": "CONTACT#",
          },
        })
      );
    }

    let contacts = (result.Items || []).map((item) => {
      const { PK, SK, GSI1PK, GSI1SK, ...contact } = item;
      return contact as VendorContact;
    });

    // Apply additional filters
    if (filter) {
      if (filter.status) {
        contacts = contacts.filter((c) => c.status === filter.status);
      }
      if (filter.partnershipStatus) {
        contacts = contacts.filter((c) => c.partnershipStatus === filter.partnershipStatus);
      }
      if (filter.source) {
        contacts = contacts.filter((c) => c.source === filter.source);
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        contacts = contacts.filter(
          (c) =>
            c.company.toLowerCase().includes(searchLower) ||
            c.contactName.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        contacts = contacts.filter((c) => filter.tags!.some((tag) => c.tags.includes(tag)));
      }
    }

    // Sort by most recently updated
    contacts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return contacts;
  }

  // Add outreach record to a contact
  static async addOutreach(contactId: string, outreach: Omit<OutreachRecord, "id">): Promise<VendorContact | null> {
    const contact = await this.getContact(contactId);
    if (!contact) return null;

    const outreachRecord: OutreachRecord = {
      ...outreach,
      id: `outreach_${Date.now()}`,
    };

    const updatedHistory = [outreachRecord, ...contact.outreachHistory];

    return this.updateContact(contactId, {
      outreachHistory: updatedHistory,
      lastContactedAt: outreach.date,
      status: contact.status === "new" ? "contacted" : contact.status,
    });
  }

  // Get contacts statistics
  static async getStats(): Promise<ContactsStats> {
    const contacts = await this.listContacts();

    const stats: ContactsStats = {
      total: contacts.length,
      byStatus: {} as Record<ContactStatus, number>,
      byCategory: {} as Record<VendorCategory, number>,
      byPartnershipStatus: {} as Record<PartnershipStatus, number>,
      contactedThisWeek: 0,
      convertedThisMonth: 0,
    };

    // Initialize counts
    Object.keys(CONTACT_STATUSES).forEach((status) => {
      stats.byStatus[status as ContactStatus] = 0;
    });
    Object.keys(VENDOR_CATEGORIES).forEach((cat) => {
      stats.byCategory[cat as VendorCategory] = 0;
    });
    Object.keys(PARTNERSHIP_STATUSES).forEach((ps) => {
      stats.byPartnershipStatus[ps as PartnershipStatus] = 0;
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    contacts.forEach((contact) => {
      stats.byStatus[contact.status]++;
      stats.byCategory[contact.category]++;
      stats.byPartnershipStatus[contact.partnershipStatus]++;

      if (contact.lastContactedAt && new Date(contact.lastContactedAt) > oneWeekAgo) {
        stats.contactedThisWeek++;
      }

      if (contact.status === "converted" && new Date(contact.updatedAt) > oneMonthAgo) {
        stats.convertedThisMonth++;
      }
    });

    return stats;
  }

  // Bulk import contacts
  static async bulkImport(
    contacts: Omit<VendorContact, "id" | "createdAt" | "updatedAt">[]
  ): Promise<{ imported: number; failed: number }> {
    let imported = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        await this.createContact(contact);
        imported++;
      } catch (error) {
        console.error("Failed to import contact:", error);
        failed++;
      }
    }

    return { imported, failed };
  }

  // Export contacts to CSV format
  static async exportToCSV(): Promise<string> {
    const contacts = await this.listContacts();

    const headers = [
      "Company",
      "Contact Name",
      "Title",
      "Email",
      "Phone",
      "Website",
      "Instagram",
      "Category",
      "Status",
      "Partnership Status",
      "City",
      "State",
      "Country",
      "Source",
      "Tags",
      "Last Contacted",
      "Notes",
    ];

    const rows = contacts.map((c) => [
      c.company,
      c.contactName,
      c.title || "",
      c.email,
      c.phone || "",
      c.website || "",
      c.instagram || "",
      c.category,
      c.status,
      c.partnershipStatus,
      c.location?.city || "",
      c.location?.state || "",
      c.location?.country || "",
      c.source,
      c.tags.join("; "),
      c.lastContactedAt || "",
      c.notes.replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  }
}
