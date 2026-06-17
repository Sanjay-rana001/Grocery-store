import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

// This endpoint saves the newly created Firebase Auth user profile into Firestore
export async function POST(request: Request) {
  try {
    const { name, email, uid } = await request.json();
    const existing = await firebaseServices.getUserByEmail(email);

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const newUser = {
      id: uid || `u-${Date.now()}`,
      name,
      email,
      role: 'customer' as const
    };

    await firebaseServices.saveUser(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
