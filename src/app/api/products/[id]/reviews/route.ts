import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id: productId } = resolvedParams;
    const body = await request.json();
    
    const newReview = await firebaseServices.addProductReview(productId, body);
    if (!newReview) {
      return NextResponse.json({ error: 'Product not found or failed to add review' }, { status: 404 });
    }
    return NextResponse.json(newReview);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add review' }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id: productId } = resolvedParams;
    const body = await request.json();
    
    // body needs to have reviewId, userId, rating, comment
    const { reviewId, userId, rating, comment } = body;
    if (!reviewId || !userId || typeof rating !== 'number' || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedReview = await firebaseServices.editProductReview(productId, reviewId, userId, rating, comment);
    if (!updatedReview) {
      return NextResponse.json({ error: 'Failed to update review or unauthorized' }, { status: 403 });
    }
    return NextResponse.json(updatedReview);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id: productId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    const reviewId = searchParams.get('reviewId');
    const userId = searchParams.get('userId');
    
    if (!reviewId || !userId) {
      return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    const success = await firebaseServices.deleteProductReview(productId, reviewId, userId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete review or unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 400 });
  }
}
