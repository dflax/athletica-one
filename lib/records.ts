import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface PersonalRecord {
  id?: string;
  userId: string;
  eventName: string;
  recordData: string;
  source?: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'Performance_Records';

export async function addPersonalRecord(userId: string, eventName: string, recordData: string, source: string = 'manual') {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      eventName,
      recordData,
      source,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding personal record: ", error);
    throw error;
  }
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const records: PersonalRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as PersonalRecord);
    });
    // Sort by eventName for now, or we could sort by createdAt
    return records.sort((a, b) => a.eventName.localeCompare(b.eventName));
  } catch (error) {
    console.error("Error getting personal records: ", error);
    throw error;
  }
}

export async function deletePersonalRecord(recordId: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, recordId));
  } catch (error) {
    console.error("Error deleting personal record: ", error);
    throw error;
  }
}
