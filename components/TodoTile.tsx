'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  getTodos, 
  addTodo, 
  toggleTodoCompletion, 
  deleteTodo, 
  TodoItem 
} from '@/lib/todos';
import { Modal } from './Modal';

interface TodoTileProps {
  user: User;
}

export const TodoTile: React.FC<TodoTileProps> = ({ user }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form states
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [user.uid]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getTodos(user.uid);
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await addTodo(user.uid, description.trim());
      setDescription('');
      setIsAddModalOpen(false);
      await fetchTodos();
    } catch (error: any) {
      console.error("Add todo error:", error);
      alert(`Failed to add item: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (todo: TodoItem) => {
    if (!todo.id) return;
    
    // Optimistic update
    const newIsComplete = !todo.isComplete;
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, isComplete: newIsComplete } : t));

    try {
      await toggleTodoCompletion(user.uid, todo.id, newIsComplete);
    } catch (error) {
      console.error("Toggle todo error:", error);
      // Revert on error
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, isComplete: !newIsComplete } : t));
    }
  };

  const handleDelete = async (todoId: string) => {
    try {
      await deleteTodo(user.uid, todoId);
      await fetchTodos();
    } catch (error) {
      console.error("Delete todo error:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">
          To Do List <span>📝</span>
        </h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-1 hover:bg-gray-100 rounded transition"
          title="Add Todo Item"
        >
          <span className="text-xl font-bold text-blue-600">+</span>
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {loading ? (
          <p className="text-gray-400 italic">Loading items...</p>
        ) : todos.length > 0 ? (
          todos.map((todo) => (
            <div key={todo.id} className="flex justify-between items-center group py-1">
              <div className="flex items-center gap-3 flex-1">
                <input 
                  type="checkbox" 
                  checked={todo.isComplete}
                  onChange={() => handleToggle(todo)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-gray-700 ${todo.isComplete ? 'line-through opacity-50' : ''}`}>
                  {todo.description}
                </span>
              </div>
              <button 
                onClick={() => todo.id && handleDelete(todo.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                title="Delete item"
              >
                <span className="text-lg">−</span>
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic text-center py-4">Nothing to do yet. Click + to add an item!</p>
        )}
      </div>

      {/* Add Todo Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add To Do Item"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Stretch for 15 mins"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              required
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </section>
  );
};
