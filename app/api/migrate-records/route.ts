import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  if (!db || !('type' in db)) {
    return NextResponse.json({ 
      error: 'Database not initialized. Check your environment variables.',
      configValid: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    }, { status: 500 });
  }

  try {
    const results = {
      migrated: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 1. Get all documents from the old top-level collection
    const oldCollectionRef = collection(db, 'Performance_Records');
    const snapshot = await getDocs(oldCollectionRef);

    console.log(`Starting migration of ${snapshot.size} records...`);

    for (const oldDoc of snapshot.docs) {
      const data = oldDoc.data();
      const userId = data.userId;

      if (!userId) {
        results.failed++;
        results.errors.push(`Doc ${oldDoc.id} missing userId`);
        continue;
      }

      try {
        // 2. Write to the new nested collection
        // We use the same document ID to keep it consistent
        const newDocRef = doc(db, 'users', userId, 'Performance_Records', oldDoc.id);
        await setDoc(newDocRef, data);
        
        // 3. Optional: Delete old document
        // await deleteDoc(oldDoc.ref);
        
        results.migrated++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Failed to migrate ${oldDoc.id}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      message: 'Migration completed', 
      results 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
