import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function GET() {
  try {
    const categories = await firebaseServices.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await firebaseServices.saveCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to save category:', error);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}
