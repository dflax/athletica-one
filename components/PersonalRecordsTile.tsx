'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  getPersonalRecords, 
  addPersonalRecord, 
  deletePersonalRecord, 
  PersonalRecord 
} from '@/lib/records';
import { Modal } from './Modal';

interface PersonalRecordsTileProps {
  user: User;
}

export const PersonalRecordsTile: React.FC<PersonalRecordsTileProps> = ({ user }) => {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<PersonalRecord | null>(null);

  // Form states
  const [eventName, setEventName] = useState('');
  const [recordData, setRecordData] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [user.uid]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getPersonalRecords(user.uid);
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !recordData) return;

    setIsSubmitting(true);
    try {
      await addPersonalRecord(user.uid, eventName, recordData);
      setEventName('');
      setRecordData('');
      setIsManualModalOpen(false);
      await fetchRecords();
    } catch (error: any) {
      console.error("Manual add error:", error);
      alert(`Failed to add record: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        // Add all scraped records to Firestore
        let successCount = 0;
        for (const record of data.records) {
          try {
            await addPersonalRecord(user.uid, record.eventName, record.recordData, 'milesplit');
            successCount++;
          } catch (err) {
            console.error(`Failed to add scraped record ${record.eventName}:`, err);
          }
        }
        setUrl('');
        setIsLinkModalOpen(false);
        await fetchRecords();
        if (successCount < data.records.length) {
          alert(`Imported ${successCount} of ${data.records.length} records. Some failed to save.`);
        }
      } else if (data.error) {
        alert(`Scraping failed: ${data.error}`);
      } else {
        alert("No records found at that URL.");
      }
    } catch (error: any) {
      console.error("Link import error:", error);
      alert(`Failed to scrape records: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (record: PersonalRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete || !recordToDelete.id) return;

    setIsSubmitting(true);
    try {
      await deletePersonalRecord(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      await fetchRecords();
    } catch (error) {
      alert("Failed to delete record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">
          Personal Records <span>🏃‍♂️</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="p-1 hover:bg-gray-100 rounded transition"
            title="Link MileSplit"
          >
            <span className="text-lg">🔗</span>
          </button>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="p-1 hover:bg-gray-100 rounded transition"
            title="Add Manual Record"
          >
            <span className="text-xl font-bold text-blue-600">+</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {loading ? (
          <p className="text-gray-400 italic">Loading records...</p>
        ) : records.length > 0 ? (
          records.map((record) => (
            <div key={record.id} className="flex justify-between items-center border-b pb-2 group">
              <div className="flex flex-col">
                <span className="text-gray-500">{record.eventName}</span>
                {record.source === 'milesplit' && (
                  <span className="text-[10px] text-blue-400">MileSplit</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-gray-800">{record.recordData}</span>
                <button 
                  onClick={() => confirmDelete(record)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete record"
                >
                  <span className="text-lg">−</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic text-center py-4">No records found. Click + or 🔗 to add some!</p>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Modal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        title="Add Personal Record"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input 
              type="text" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. 100m, High Jump"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record Data</label>
            <input 
              type="text" 
              value={recordData}
              onChange={(e) => setRecordData(e.target.value)}
              placeholder={"e.g. 13.1s, 5'10\""}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Save Record'}
          </button>
        </form>
      </Modal>

      {/* Link URL Modal */}
      <Modal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)} 
        title="Link MileSplit Profile"
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Enter your MileSplit athlete profile URL to automatically import your PRs.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MileSplit URL</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://nj.milesplit.com/athletes/..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Importing...' : 'Link & Import'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
      >
        <div className="space-y-4 text-center">
          <p className="text-gray-600">Are you sure you want to delete the record for <span className="font-bold text-gray-800">{recordToDelete?.eventName}</span>?</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
