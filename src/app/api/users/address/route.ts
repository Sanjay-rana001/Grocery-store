import { NextResponse } from 'next/server';
import * as serverDb from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const { email, address } = await request.json();
    const user = serverDb.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.address = address;
    serverDb.saveUser(user);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
