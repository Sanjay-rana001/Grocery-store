import { NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${folder}/${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    // Upload to Firebase Storage via Admin SDK (bypasses security rules)
    const bucket = getAdminStorage().bucket();
    const fileRef = bucket.file(filename);
    
    await fileRef.save(buffer, {
      metadata: { contentType: file.type }
    });
    
    await fileRef.makePublic(); // Make the file publicly accessible
    const url = fileRef.publicUrl();
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Firebase Admin Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file to database storage.' }, { status: 500 });
  }
}
