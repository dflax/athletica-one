// src/app/page.tsx
'use client';

import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '@/lib/useAuth';
import { PersonalRecordsTile } from '@/components/PersonalRecordsTile';
import { TodoTile } from '@/components/TodoTile';

export default function Dashboard() {
  const { user, loading } = useAuth();

  const login = async () => {
    try {
      console.log('Starting login...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful:', result.user);
    } catch (error: any) {
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData,
      });
      alert(`Login failed: ${error.message}`);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Athletica...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
      
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">Athletica One</h1>
        {user ? (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img src={user.photoURL} className="w-10 h-10 rounded-full border" alt="Profile" />
            )}
            <button onClick={() => signOut(auth)} className="text-sm text-gray-500 hover:text-red-500 transition">Sign Out</button>
          </div>
        ) : (
          <button type="button" onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Athlete Login</button>
        )}
      </header>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg md:col-span-2">
            <h2 className="text-xl font-semibold">Welcome back, {user.displayName || 'Athlete'}</h2>
            <p className="opacity-90">Ready for today's training session?</p>
          </section>

          {/* Personal Records Tile */}
          <PersonalRecordsTile user={user} />

          {/* To Do List Tile */}
          <TodoTile user={user} />

          {/* Quick Actions Card */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Quick Log</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-100 p-3 rounded-xl text-xs font-semibold hover:bg-blue-50 transition">Log Workout</button>
              <button className="bg-gray-100 p-3 rounded-xl text-xs font-semibold hover:bg-blue-50 transition">Log Meal</button>
            </div>
          </section>
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your performance, centralized.</h2>
          <p className="text-gray-600 mb-8">Sign in to track your PRs, training, and nutrition.</p>
          <button type="button" onClick={login} className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      )}
      </div>
    </main>
  );
}
