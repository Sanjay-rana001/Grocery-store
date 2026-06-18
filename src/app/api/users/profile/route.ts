import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/firebaseServices';
import { Address } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { email, name, address, profileImage } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required to identify user' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 });
    }

    // Update fields
    if (name) user.name = name;
    if (address) user.address = address as Address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Save back to Firestore
    await saveUser(user);

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
