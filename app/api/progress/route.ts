import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProgressModel } from '@/models/ProgressModel';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const allProgress = await ProgressModel.find({});
      if (allProgress.length > 0) {
        return NextResponse.json({ success: true, progress: allProgress });
      }
    }
    return NextResponse.json({ success: true, progress: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
