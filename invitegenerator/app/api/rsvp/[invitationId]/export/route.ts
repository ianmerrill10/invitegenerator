import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || 'invitations';
const RSVP_TABLE = process.env.DYNAMODB_RSVP_TABLE || 'rsvps';

// GET /api/rsvp/[invitationId]/export - Export RSVPs to CSV or XLSX
export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const { invitationId } = params;
    
    // Validate invitation ID format
    if (!invitationId || !/^[a-zA-Z0-9-]{36}$/.test(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }

    // Get auth token from cookie or header
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this invitation
    const userId = await verifyTokenAndGetUserId(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch invitation to verify ownership
    const getInvitationCommand = new GetItemCommand({
      TableName: INVITATIONS_TABLE,
      Key: marshall({ id: invitationId }),
    });

    const invitationResult = await dynamodb.send(getInvitationCommand);
    
    if (!invitationResult.Item) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item);

    // Verify ownership
    if (invitation.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const attending = searchParams.get('attending'); // Filter by attendance status

    // Validate format
    if (!['csv', 'xlsx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "xlsx"' },
        { status: 400 }
      );
    }

    // Fetch all RSVPs for this invitation
    const rsvps = await fetchAllRSVPs(invitationId);

    // Apply attendance filter if specified
    let filteredRsvps = rsvps;
    if (attending && ['yes', 'no', 'maybe'].includes(attending)) {
      filteredRsvps = rsvps.filter(r => r.attending === attending);
    }

    // Get custom questions for headers
    const customQuestions = invitation.rsvpSettings?.customQuestions || [];

    // Generate export
    if (format === 'csv') {
      const csv = generateCSV(filteredRsvps, customQuestions);
      const filename = `rsvp-export-${invitation.shortId}-${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // For XLSX, we'll generate a simple XML-based spreadsheet
      const xlsx = generateXLSX(filteredRsvps, customQuestions, invitation.title);
      const filename = `rsvp-export-${invitation.shortId}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(xlsx, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to export RSVPs' },
      { status: 500 }
    );
  }
}

// Fetch all RSVPs (handles pagination)
async function fetchAllRSVPs(invitationId: string): Promise<any[]> {
  const allRsvps: any[] = [];
  let lastEvaluatedKey: any = undefined;

  do {
    const queryCommand = new QueryCommand({
      TableName: RSVP_TABLE,
      IndexName: 'invitationId-createdAt-index',
      KeyConditionExpression: 'invitationId = :invitationId',
      ExpressionAttributeValues: marshall({
        ':invitationId': invitationId,
      }),
      ScanIndexForward: false,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await dynamodb.send(queryCommand);
    
    if (result.Items) {
      allRsvps.push(...result.Items.map(item => unmarshall(item)));
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return allRsvps;
}

// Generate CSV content
function generateCSV(rsvps: any[], customQuestions: any[]): string {
  // Define headers
  const baseHeaders = [
    'Name',
    'Email',
    'Phone',
    'Attending',
    'Guest Count',
    'Guest Names',
    'Dietary Restrictions',
    'Message',
    'Submitted At',
  ];

  // Add custom question headers
  const customHeaders = customQuestions.map(q => q.question);
  const allHeaders = [...baseHeaders, ...customHeaders];

  // Create CSV rows
  const rows: string[] = [];
  
  // Add header row
  rows.push(allHeaders.map(h => escapeCSVField(h)).join(','));

  // Add data rows
  for (const rsvp of rsvps) {
    const row: string[] = [
      escapeCSVField(rsvp.name || ''),
      escapeCSVField(rsvp.email || ''),
      escapeCSVField(rsvp.phone || ''),
      escapeCSVField(formatAttending(rsvp.attending)),
      String(rsvp.guestCount || 1),
      escapeCSVField((rsvp.guestNames || []).join('; ')),
      escapeCSVField(rsvp.dietaryRestrictions || ''),
      escapeCSVField(rsvp.message || ''),
      escapeCSVField(formatDate(rsvp.createdAt)),
    ];

    // Add custom question answers
    for (const question of customQuestions) {
      const answer = rsvp.customAnswers?.[question.id];
      if (typeof answer === 'boolean') {
        row.push(answer ? 'Yes' : 'No');
      } else {
        row.push(escapeCSVField(String(answer || '')));
      }
    }

    rows.push(row.join(','));
  }

  // Add BOM for UTF-8 compatibility with Excel
  return '\ufeff' + rows.join('\n');
}

// Escape CSV field
function escapeCSVField(field: string): string {
  // Decode HTML entities
  field = field
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
    
  // If field contains comma, newline, or quote, wrap in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Escape quotes by doubling them
    field = field.replace(/"/g, '""');
    return `"${field}"`;
  }
  return field;
}

// Generate simple XLSX (SpreadsheetML XML format that Excel can open)
function generateXLSX(rsvps: any[], customQuestions: any[], title: string): Buffer {
  // Define headers
  const baseHeaders = [
    'Name',
    'Email',
    'Phone',
    'Attending',
    'Guest Count',
    'Guest Names',
    'Dietary Restrictions',
    'Message',
    'Submitted At',
  ];

  const customHeaders = customQuestions.map(q => q.question);
  const allHeaders = [...baseHeaders, ...customHeaders];

  // Build XML for SpreadsheetML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#FF6B47" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Yes">
      <Interior ss:Color="#D4EDDA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="No">
      <Interior ss:Color="#F8D7DA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Maybe">
      <Interior ss:Color="#FFF3CD" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="RSVPs">
    <Table>`;

  // Add column widths
  for (let i = 0; i < allHeaders.length; i++) {
    xml += `<Column ss:Width="120"/>`;
  }

  // Add header row
  xml += `<Row ss:StyleID="Header">`;
  for (const header of allHeaders) {
    xml += `<Cell><Data ss:Type="String">${escapeXML(header)}</Data></Cell>`;
  }
  xml += `</Row>`;

  // Add data rows
  for (const rsvp of rsvps) {
    const styleId = rsvp.attending === 'yes' ? 'Yes' : rsvp.attending === 'no' ? 'No' : 'Maybe';
    xml += `<Row ss:StyleID="${styleId}">`;
    
    // Base fields
    xml += `<Cell><Data ss:Type="String">${escapeXML(rsvp.name || '')}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(rsvp.email || '')}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(rsvp.phone || '')}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(formatAttending(rsvp.attending))}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="Number">${rsvp.guestCount || 1}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML((rsvp.guestNames || []).join('; '))}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(rsvp.dietaryRestrictions || '')}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(rsvp.message || '')}</Data></Cell>`;
    xml += `<Cell><Data ss:Type="String">${escapeXML(formatDate(rsvp.createdAt))}</Data></Cell>`;

    // Custom question answers
    for (const question of customQuestions) {
      const answer = rsvp.customAnswers?.[question.id];
      if (typeof answer === 'boolean') {
        xml += `<Cell><Data ss:Type="String">${answer ? 'Yes' : 'No'}</Data></Cell>`;
      } else {
        xml += `<Cell><Data ss:Type="String">${escapeXML(String(answer || ''))}</Data></Cell>`;
      }
    }

    xml += `</Row>`;
  }

  xml += `</Table>
  </Worksheet>
</Workbook>`;

  return Buffer.from(xml, 'utf-8');
}

// Escape XML special characters
function escapeXML(str: string): string {
  // First decode HTML entities
  str = str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  
  // Then escape for XML
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format attendance status
function formatAttending(status: string): string {
  switch (status) {
    case 'yes': return 'Attending';
    case 'no': return 'Not Attending';
    case 'maybe': return 'Maybe';
    default: return status;
  }
}

// Format date for display
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

// Verify token and get user ID
async function verifyTokenAndGetUserId(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}
