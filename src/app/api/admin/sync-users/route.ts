import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function POST() {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users;

    const batch = adminDb.batch();
    const usersCol = adminDb.collection('users');

    let syncedCount = 0;

    for (const user of users) {
      const docRef = usersCol.doc(user.uid);
      const docSnap = await docRef.get();
      
      // If user doesn't exist in Firestore, create their profile
      if (!docSnap.exists) {
        batch.set(docRef, {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'Unknown'),
          role: 'customer' // By default sync them as customers
        }, { merge: true });
        syncedCount++;
      }
    }

    if (syncedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, count: syncedCount, total: users.length });
  } catch (error: any) {
    console.error('Firebase Auth Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
