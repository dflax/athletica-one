import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export interface TodoItem {
  id?: string;
  description: string;
  isComplete: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = 'Todo_Items';

export async function addTodo(userId: string, description: string) {
  if (!db || !('type' in db)) {
    throw new Error("Database not initialized");
  }
  
  try {
    const docRef = await addDoc(collection(db, 'users', userId, COLLECTION_NAME), {
      description,
      isComplete: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding todo: ", error);
    throw error;
  }
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
  if (!db || !('type' in db)) {
    return [];
  }
  
  try {
    const q = query(
      collection(db, 'users', userId, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const todos: TodoItem[] = [];
    querySnapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() } as TodoItem);
    });
    return todos;
  } catch (error) {
    console.error("Error getting todos: ", error);
    throw error;
  }
}

export async function toggleTodoCompletion(userId: string, todoId: string, isComplete: boolean) {
  if (!db || !('type' in db)) {
    throw new Error("Database not initialized");
  }

  try {
    const todoRef = doc(db, 'users', userId, COLLECTION_NAME, todoId);
    await updateDoc(todoRef, {
      isComplete: isComplete
    });
  } catch (error) {
    console.error("Error toggling todo completion: ", error);
    throw error;
  }
}

export async function deleteTodo(userId: string, todoId: string) {
  if (!db || !('type' in db)) {
    throw new Error("Database not initialized");
  }

  try {
    await deleteDoc(doc(db, 'users', userId, COLLECTION_NAME, todoId));
  } catch (error) {
    console.error("Error deleting todo: ", error);
    throw error;
  }
}
