'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import LogTable from '@/components/LogTable';
import LogDetailsModal from '@/components/LogDetailsModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
  id: string;
  date: string;
  description: string;
  createdAt: any;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  // New State
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);

        // Subscribe to logs
        try {
          const q = query(
            collection(db, 'logs'),
            where('userId', '==', currentUser.uid),
            orderBy('date', 'desc')
          );

          const unsubscribeLogs = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as LogEntry[];
            setLogs(logsData);
            setLoading(false);
          }, (error) => {
            console.error("Firestore error:", error);
            // If error (e.g. missing index), still stop loading so user sees something
            setLoading(false);
          });

          return () => unsubscribeLogs();
        } catch (err) {
          console.error("Error creating query:", err);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        date,
        description,
        createdAt: Timestamp.now()
      });
      setDescription('');
    } catch (error) {
      console.error('Error adding log: ', error);
      alert('Failed to save log.');
    }
  };

  const handleExport = () => {
    const data = logs.map(log => ({
      Date: log.date,
      Description: log.description
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Internship Logs");
    XLSX.writeFile(wb, "internship_logs.xlsx");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Selection Logic
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

  const handleDelete = async () => {
    if (selectedLogs.size === 0) return;

    try {
      const batch = writeBatch(db);
      selectedLogs.forEach(id => {
        const docRef = doc(db, 'logs', id);
        batch.delete(docRef);
      });
      await batch.commit();

      setSelectedLogs(new Set());
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting logs:", error);
      alert("Failed to delete logs");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      <div className="animated-bg"></div>

      <Navbar userEmail={user?.email} onLogout={handleLogout} />

      {/* Modals */}
      <LogDetailsModal
        log={viewingLog}
        onClose={() => setViewingLog(null)}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        count={selectedLogs.size}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <div className="max-w-6xl mx-auto relative z-10 pt-24 px-6 md:px-12 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-8 rounded-3xl lg:sticky lg:top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                {t('new_entry')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('date')}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-0 py-3 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('description')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('placeholder_desc')}
                    className="w-full glass-input rounded-xl px-4 py-3 text-white h-40 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 btn-primary text-white font-bold rounded-xl shadow-lg mt-2"
                >
                  {t('save_entry')}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {/* Unified Header Panel */}
            <div className="glass-panel p-6 rounded-3xl mb-6 flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-24 z-20 backdrop-blur-xl bg-[#0a0a0a]/60 border border-white/10">
              <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full"></span>
                  {t('recent_logs')}
                </h2>

                {/* Mobile Select All (Visible only on mobile list view) */}
                {viewMode === 'list' && logs.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="xl:hidden text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {selectedLogs.size === logs.length ? 'Deselect All' : t('select_all')}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                {/* Delete Button (Conditional) */}
                {selectedLogs.size > 0 && (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium animate-fade-in flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    {t('delete')} <span className="bg-red-500/20 px-1.5 py-0.5 rounded text-xs">{selectedLogs.size}</span>
                  </button>
                )}

                {/* Select All (Desktop List View) */}
                {viewMode === 'list' && logs.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="hidden xl:block px-4 py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/10"
                  >
                    {selectedLogs.size === logs.length ? 'Deselect All' : t('select_all')}
                  </button>
                )}

                {/* View Toggle */}
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="hidden sm:inline">{t('view_list')}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 18.375h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125" />
                    </svg>
                    <span className="hidden sm:inline">{t('view_table')}</span>
                  </button>
                </div>

                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 font-medium hover:scale-105 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  <span className="hidden sm:inline">{t('export_excel')}</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 glass-panel rounded-3xl border-dashed border-2 border-slate-700">
                    <p className="text-lg">{t('no_logs')}</p>
                    <p className="text-sm opacity-60">{t('start_adding')}</p>
                  </div>
                ) : (
                  <>
                    {logs.map((log) => {
                      const isSelected = selectedLogs.has(log.id);
                      return (
                        <div
                          key={log.id}
                          onClick={() => setViewingLog(log)}
                          className={`glass-panel p-6 rounded-2xl transition-all group cursor-pointer relative ${isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-white/5'
                            }`}
                        >
                          <div className="absolute top-6 right-6 z-10" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(log.id)}
                              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between items-start mb-3 pr-8">
                            <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                              {new Date(log.date).toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base line-clamp-3">
                            {log.description}
                          </p>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            ) : (
              <LogTable
                logs={logs}
                selectedIds={selectedLogs}
                onToggleSelect={toggleSelect}
                onSelectAll={toggleSelectAll}
                onView={setViewingLog}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
