import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPersonalRecord, getPersonalRecords, deletePersonalRecord } from './records';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock @/lib/firebase
vi.mock('./firebase', () => ({
  db: { type: 'firestore' },
  auth: { currentUser: { uid: 'test-user-123' } }
}));

describe('records service', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addPersonalRecord', () => {
    it('should add a record document', async () => {
      const mockDocRef = { id: 'record-123' };
      (firestore.addDoc as any).mockResolvedValue(mockDocRef);

      const result = await addPersonalRecord(userId, '100m', '10.5s');

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('record-123');
    });
  });

  describe('getPersonalRecords', () => {
    it('should fetch and return sorted records', async () => {
      const mockSnapshot = {
        size: 2,
        forEach: (callback: any) => {
          callback({
            id: '1',
            data: () => ({ eventName: 'B Event', recordData: '10s' })
          });
          callback({
            id: '2',
            data: () => ({ eventName: 'A Event', recordData: '11s' })
          });
        }
      };
      (firestore.getDocs as any).mockResolvedValue(mockSnapshot);

      const result = await getPersonalRecords(userId);

      expect(result).toHaveLength(2);
      expect(result[0].eventName).toBe('A Event'); // Sorted
      expect(result[1].eventName).toBe('B Event');
    });
  });

  describe('deletePersonalRecord', () => {
    it('should delete the record document', async () => {
      const recordId = 'record-123';
      await deletePersonalRecord(userId, recordId);

      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });
});
