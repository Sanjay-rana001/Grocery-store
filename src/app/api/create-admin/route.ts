import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { saveUser } from '@/lib/firebaseServices';

export async function GET() {
  const email = 'sanjayranatanabana@gmail.com';
  const password = 'Sanjay@123';
  
  try {
    let uid = '';
    
    // 1. Try to create the user in Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (createError: any) {
      // If the user already exists, just sign in to get their UID
      if (createError.code === 'auth/email-already-in-use') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } else {
        throw createError;
      }
    }

    // 2. Save/Update their profile in Firestore and force the role to 'admin'
    await saveUser({
      id: uid,
      name: 'Sanjay Admin',
      email: email,
      role: 'admin'
    });

    return NextResponse.json({ success: true, message: `Admin user ${email} configured successfully!` });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
