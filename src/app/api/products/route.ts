import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter');
    
    let products = await firebaseServices.getProducts();

    if (category && category !== 'all') {
      products = products.filter(p => 
        (p.categoryId && p.categoryId.toLowerCase() === category.toLowerCase()) || 
        (p.category && p.category.toLowerCase() === category.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (filter) {
      if (filter === 'organic') {
        products = products.filter(p => p.organic);
      } else if (filter === 'deals') {
        products = products.filter(p => p.originalPrice !== undefined);
      } else if (filter === 'seasonal') {
        products = products.filter(p => p.seasonal);
      }
    }

    return NextResponse.json(products);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Firebase fetch error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await firebaseServices.saveProduct(body);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 400 });
  }
}
