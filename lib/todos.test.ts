import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addTodo, getTodos, toggleTodoCompletion, deleteTodo } from './todos';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  orderBy: vi.fn(),
}));

// Mock @/lib/firebase
const { mockDb } = vi.hoisted(() => ({
  mockDb: { type: 'firestore' }
}));

vi.mock('./firebase', () => ({
  db: mockDb, 
}));

describe('todos service', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.type = 'firestore';
  });

  describe('addTodo', () => {
    it('should add a todo document', async () => {
      const description = 'Test todo';
      const mockDocRef = { id: 'todo-123' };
      (firestore.addDoc as any).mockResolvedValue(mockDocRef);

      const result = await addTodo(userId, description);

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('todo-123');
    });

    it('should throw error if database not initialized', async () => {
      delete (mockDb as any).type;
      
      await expect(addTodo(userId, 'test')).rejects.toThrow('Database not initialized');
    });
  });

  describe('getTodos', () => {
    it('should fetch and return todos', async () => {
      const mockSnapshot = {
        forEach: (callback: any) => {
          callback({
            id: '1',
            data: () => ({ description: 'Todo 1', isComplete: false })
          });
        }
      };
      (firestore.getDocs as any).mockResolvedValue(mockSnapshot);

      const result = await getTodos(userId);

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Todo 1');
    });
  });

  describe('toggleTodoCompletion', () => {
    it('should update the isComplete field', async () => {
      const todoId = 'todo-123';
      const mockDoc = { id: 'mock-doc' };
      (firestore.doc as any).mockReturnValue(mockDoc);

      await toggleTodoCompletion(userId, todoId, true);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        mockDoc,
        { isComplete: true }
      );
    });
  });

  describe('deleteTodo', () => {
    it('should delete the todo document', async () => {
      const todoId = 'todo-123';
      await deleteTodo(userId, todoId);

      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });
});
