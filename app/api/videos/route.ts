import { NextResponse } from 'next/server';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo } from '@/lib/dynamo';
import { INITIAL_VIDEOS } from '@/lib/mockData';

export async function GET() {
  try {
    const data = await dynamo.send(
      new ScanCommand({
        TableName: 'Videos',
      })
    );
    return NextResponse.json(data.Items && data.Items.length > 0 ? data.Items : INITIAL_VIDEOS);
  } catch (error) {
    return NextResponse.json(INITIAL_VIDEOS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const videoId = body.id || `vid-${Date.now()}`;
    const item = {
      PK: `VIDEO#${videoId}`,
      SK: 'METADATA',
      ...body,
      addedAt: new Date().toISOString(),
    };

    await dynamo.send(
      new PutCommand({
        TableName: 'Videos',
        Item: item,
      })
    );

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
