/**
 * DynamoDB Backup Script
 *
 * Creates backups of all DynamoDB tables to JSON files
 *
 * Run: npx tsx scripts/backup-dynamodb.ts
 */

import { DynamoDBClient, ScanCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import * as fs from "fs";
import * as path from "path";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLES_TO_BACKUP = [
  process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production",
  process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production",
  process.env.DYNAMODB_RSVPS_TABLE || "InviteGenerator-RSVPs-production",
  process.env.DYNAMODB_TEMPLATES_TABLE || "InviteGenerator-Templates-production",
  process.env.DYNAMODB_CONTACTS_TABLE || "InviteGenerator-Contacts-production",
  process.env.DYNAMODB_AFFILIATES_TABLE || "InviteGenerator-Affiliates-production",
  process.env.DYNAMODB_AFFILIATE_REFERRALS_TABLE || "InviteGenerator-AffiliateReferrals-production",
  process.env.DYNAMODB_AFFILIATE_COMMISSIONS_TABLE || "InviteGenerator-AffiliateCommissions-production",
  process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production",
];

async function listAllTables(): Promise<string[]> {
  const tables: string[] = [];
  let lastEvaluatedTableName: string | undefined;

  do {
    const result = await dynamodb.send(
      new ListTablesCommand({
        ExclusiveStartTableName: lastEvaluatedTableName,
      })
    );

    if (result.TableNames) {
      tables.push(...result.TableNames);
    }
    lastEvaluatedTableName = result.LastEvaluatedTableName;
  } while (lastEvaluatedTableName);

  return tables;
}

async function scanTable(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  console.log(`  Scanning ${tableName}...`);

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey as never,
      })
    );

    if (result.Items) {
      const unmarshalled = result.Items.map((item) => unmarshall(item));
      items.push(...unmarshalled);
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);

  console.log(`  Found ${items.length} items in ${tableName}`);
  return items;
}

async function backupTable(
  tableName: string,
  backupDir: string
): Promise<{ tableName: string; itemCount: number; fileName: string }> {
  try {
    const items = await scanTable(tableName);
    const fileName = `${tableName}.json`;
    const filePath = path.join(backupDir, fileName);

    const backupData = {
      tableName,
      exportedAt: new Date().toISOString(),
      itemCount: items.length,
      items,
    };

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    return {
      tableName,
      itemCount: items.length,
      fileName,
    };
  } catch (error) {
    console.error(`  Error backing up ${tableName}:`, error);
    throw error;
  }
}

async function main() {
  console.log("DynamoDB Backup Script");
  console.log("======================\n");

  // Create backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", `dynamodb-${timestamp}`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Backup directory: ${backupDir}\n`);

  // Check which tables exist
  console.log("Checking available tables...\n");
  let availableTables: string[];

  try {
    availableTables = await listAllTables();
    console.log(`Found ${availableTables.length} tables in the region\n`);
  } catch (error) {
    console.error("Error listing tables:", error);
    process.exit(1);
  }

  // Filter to only backup tables that exist
  const tablesToBackup = TABLES_TO_BACKUP.filter((table) =>
    availableTables.includes(table)
  );

  if (tablesToBackup.length === 0) {
    console.log("No tables found to backup.");
    console.log("Available tables:", availableTables.join(", ") || "None");
    process.exit(0);
  }

  console.log(`Backing up ${tablesToBackup.length} tables:\n`);

  const results: { tableName: string; itemCount: number; fileName: string }[] = [];

  for (const tableName of tablesToBackup) {
    try {
      const result = await backupTable(tableName, backupDir);
      results.push(result);
    } catch (error) {
      console.error(`Failed to backup ${tableName}:`, error);
    }
  }

  // Create manifest file
  const manifest = {
    backupId: timestamp,
    createdAt: new Date().toISOString(),
    region: process.env.AWS_REGION || "us-east-1",
    tables: results,
    totalItems: results.reduce((sum, r) => sum + r.itemCount, 0),
  };

  fs.writeFileSync(
    path.join(backupDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  // Summary
  console.log("\n======================");
  console.log("Backup Complete!\n");
  console.log(`Tables backed up: ${results.length}`);
  console.log(`Total items: ${manifest.totalItems}`);
  console.log(`Backup location: ${backupDir}`);
  console.log("\nFiles created:");
  results.forEach((r) => {
    console.log(`  - ${r.fileName} (${r.itemCount} items)`);
  });
  console.log("  - manifest.json");
}

main().catch((error) => {
  console.error("Backup failed:", error);
  process.exit(1);
});
