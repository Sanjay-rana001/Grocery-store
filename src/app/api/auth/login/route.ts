import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

// This endpoint now only fetches the user profile from Firestore.
// Actual password checking is handled client-side by Firebase Auth.
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = await firebaseServices.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
