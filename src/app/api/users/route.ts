import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/firebaseServices';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
