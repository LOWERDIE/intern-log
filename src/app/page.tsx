'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import LogTable from '@/components/LogTable';
import LogDetailsModal from '@/components/LogDetailsModal';
import EditLogModal from '@/components/EditLogModal';
import AddLogModal from '@/components/AddLogModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

import MetricsCards from '@/components/MetricsCards';
import CalendarView from '@/components/CalendarView';
import LogGrid from '@/components/LogGrid'; // Added
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext'; // Added
import Loading from '@/components/Loading'; // Added

interface LogEntry {
  id: string;
  date: string;
  description: string;
  hours?: number;
  workLink?: string;
  createdAt: any;
}

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { showToast } = useToast(); // Added
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid'); // Default to grid

  // New State
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  // Handle Loading Fade Out


  // Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        router.push('/login');
      } else {
        // Fetch logs
        const q = query(collection(db, 'logs'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'));
        const unsubscribeLogs = onSnapshot(q, (snapshot) => {
          const logsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as LogEntry[];
          setLogs(logsData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching logs:", error);
          setLoading(false);
        });
        return () => unsubscribeLogs();
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handlers
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddLog = async (data: { date: string, description: string, workLink: string, hours: number }) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        date: data.date,
        hours: data.hours,
        description: data.description,
        workLink: data.workLink,
        createdAt: Timestamp.now(),
      });
      // Modal closes automatically by calling component
      showToast(t('log_added') || 'Successfully added record', 'success');
    } catch (error) {
      console.error("Error adding log:", error);
      alert(t('error_adding_log'));
    }
  };


  const handleUpdateLog = async (updatedLog: LogEntry) => {
    try {
      const logRef = doc(db, 'logs', updatedLog.id);
      await updateDoc(logRef, {
        date: updatedLog.date,
        hours: updatedLog.hours,
        description: updatedLog.description,
        workLink: updatedLog.workLink,
      });
      setEditingLog(null);
      showToast(t('log_updated') || 'Successfully updated record', 'success');
    } catch (error) {
      console.error("Error updating log:", error);
      alert(t('error_updating_log'));
    }
  };

  const handleDelete = async () => {
    try {
      const batch = writeBatch(db);
      selectedLogs.forEach((id) => {
        const logRef = doc(db, 'logs', id);
        batch.delete(logRef);
      });
      await batch.commit();
      setSelectedLogs(new Set());
      setIsDeleteModalOpen(false);
      showToast(t('logs_deleted') || 'Successfully deleted records', 'error');
    } catch (error) {
      console.error("Error deleting logs:", error);
      alert(t('error_deleting_logs'));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLogs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLogs.size === logs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(logs.map(log => log.id)));
    }
  };

  const handleExport = () => {
    const data = logs.map(log => ({
      Date: log.date,
      Hours: log.hours || 8,
      Description: log.description,
      Link: log.workLink || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "internship_logs.xlsx");
  };

  // Calculate stats
  const totalHours = logs.reduce((acc, log) => {
    const h = (log.hours !== undefined && log.hours !== null) ? Number(log.hours) : 8;
    return acc + h;
  }, 0);
  const totalDays = totalHours / 8;
  const totalMonths = totalDays / 22;
  const daysOff = logs.filter(log => log.hours === 0).length;

  // Date Range
  const dates = logs.map(l => l.date).sort();
  const dateRange = dates.length > 0
    ? `${new Date(dates[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(dates[dates.length - 1]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'No records';

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="animated-bg"></div>

      {user && (
        <>
          <Navbar userEmail={user.email} onLogout={handleLogout} />

          {/* Modals */}
          <AddLogModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddLog}
          />
          <LogDetailsModal
            log={viewingLog}
            onClose={() => setViewingLog(null)}
            onEdit={(log) => {
              setViewingLog(null);
              setEditingLog(log);
            }}
          />
          <EditLogModal
            log={editingLog}
            isOpen={!!editingLog}
            onClose={() => setEditingLog(null)}
            onSave={handleUpdateLog}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            count={selectedLogs.size}
            onConfirm={handleDelete}
            onCancel={() => setIsDeleteModalOpen(false)}
          />

          <div className="max-w-7xl mx-auto relative z-10 pt-24 px-6 md:px-12 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Dashboard</h2>
                <p className="text-slate-400">Your internship overview</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-slate-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Export Excel
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm shadow-lg shadow-blue-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Record
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <MetricsCards
              totalHours={totalHours}
              totalDays={totalDays}
              totalMonths={totalMonths}
              daysOff={daysOff}
            />

            {/* Date Range Banner */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 mb-8 flex items-center gap-3 text-slate-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {dateRange}
            </div>

            {/* Records Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-white">Records</h3>

              <div className="flex rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Calendar
                </button>
              </div>
            </div>

            {/* Records Content */}
            {viewMode === 'grid' && (
              <LogGrid
                logs={logs}
                selectedLogs={selectedLogs}
                onToggleSelect={toggleSelect}
                onView={setViewingLog}
              />
            )}

            {viewMode === 'list' && (
              <LogTable
                logs={logs}
                selectedIds={selectedLogs}
                onToggleSelect={toggleSelect}
                onSelectAll={toggleSelectAll}
                onView={setViewingLog}
              />
            )}

            {viewMode === 'calendar' && (
              <CalendarView logs={logs} onViewLog={setViewingLog} />
            )}

            {/* Action Bar (Delete) - Fixed at bottom if selection active */}
            {selectedLogs.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 p-2 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-fade-in-up">
                <span className="text-sm text-slate-300 ml-2">{selectedLogs.size} selected</span>
                <div className="h-6 w-px bg-white/10"></div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Deselect
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </div >
  );
}
