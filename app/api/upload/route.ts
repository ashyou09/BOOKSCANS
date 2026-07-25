import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/pdfs directory exists
    const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
    await mkdir(pdfsDir, { recursive: true });

    // Clean filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = path.join(pdfsDir, sanitizedFileName);

    // Save PDF to public/pdfs/
    await writeFile(filePath, buffer);

    const publicUrl = `/pdfs/${sanitizedFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: sanitizedFileName,
    });
  } catch (error: any) {
    console.error('File save error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
