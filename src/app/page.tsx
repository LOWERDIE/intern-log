'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, writeBatch, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';
import LogTable from '@/components/LogTable';
import LogDetailsModal from '@/components/LogDetailsModal';
import EditLogModal from '@/components/EditLogModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Loading from '@/components/Loading';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
  id: string;
  date: string;
  description: string;
  hours?: number;
  workLink?: string;
  createdAt: any;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [hours, setHours] = useState(8);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [isCustomHours, setIsCustomHours] = useState(false);

  // New State
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [viewingLog, setViewingLog] = useState<LogEntry | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  // Handle Loading Fade Out
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowLoadingOverlay(false);
      }, 800); // 800ms fade out duration
      return () => clearTimeout(timer);
    }
  }, [loading]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !user) return;

    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        date,
        hours,
        description,
        workLink,
        createdAt: Timestamp.now(),
      });
      setDescription('');
      setWorkLink('');
      setHours(8); // Reset to default
      setIsCustomHours(false);
      // Date stays the same for convenience
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
  // Calculate stats
  const totalHours = logs.reduce((acc, log) => {
    // Respect 0 as a valid value for holidays/leave
    const h = (log.hours !== undefined && log.hours !== null) ? Number(log.hours) : 8;
    return acc + h;
  }, 0);
  const totalDays = totalHours / 8;
  const totalMonths = totalDays / 22;

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-700 ease-in-out ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Loading />
        </div>
      )}

      <div className={`transition-opacity duration-1000 delay-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="animated-bg"></div>

        {user && (
          <>
            <Navbar userEmail={user.email} onLogout={handleLogout} />

            {/* Modals */}
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('date')}</label>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full glass-input rounded-xl px0 py-3 text-white text-center text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('hours')}</label>
                          <div className="flex gap-2">
                            <select
                              value={isCustomHours ? 'custom' : hours}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  setIsCustomHours(true);
                                  setHours(0); // Reset or keep previous? Let's default to 0 for custom input
                                } else {
                                  setIsCustomHours(false);
                                  setHours(Number(val));
                                }
                              }}
                              className="w-full glass-input rounded-xl px-2 py-3.5 text-white text-center appearance-none cursor-pointer text-sm text-center"
                            >
                              <option value={8}>8 {t('hours_suffix')}</option>
                              <option value={4}>4 {t('hours_suffix')}</option>
                              <option value={0}>{t('holiday_leave')}</option>
                              <option value="custom">{t('custom')}</option>
                            </select>
                            {isCustomHours && (
                              <input
                                type="number"
                                value={hours === 0 ? '' : hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                placeholder="0"
                                className="w-20 glass-input rounded-xl px-2 py-3.5 text-white text-center text-sm"
                                min="0"
                                step="0.5"
                              />
                            )}
                          </div>
                        </div>
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

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('work_link') || 'Work Link'}</label>
                        <input
                          type="url"
                          value={workLink}
                          onChange={(e) => setWorkLink(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full glass-input rounded-xl px-4 py-3 text-white"
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
                  {/* Summary Stats Bar */}
                  <div className="glass-panel p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 border border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('hours')}</span>
                      <span className="text-xl md:text-2xl font-bold text-emerald-400">{totalHours}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('days')}</span>
                      <span className="text-xl md:text-2xl font-bold text-blue-400">{totalDays.toFixed(1)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('months')}</span>
                      <span className="text-xl md:text-2xl font-bold text-purple-400">{totalMonths.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Unified Header Panel */}
                  <div className="glass-panel p-4 md:p-6 rounded-3xl mb-6 flex flex-row justify-between items-center gap-2 md:gap-4 sticky top-24 z-20 backdrop-blur-xl bg-[#0a0a0a]/60 border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex items-center gap-3 md:gap-4">
                      <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3 whitespace-nowrap">
                        <span className="w-1 h-6 md:h-8 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></span>
                        {t('recent_logs')}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      {/* View Toggle */}
                      <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 backdrop-blur-md">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${viewMode === 'list' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-4 md:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="hidden sm:inline">{t('view_list')}</span>
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`p-2 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] scale-105' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-4 md:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 18.375h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125" />
                          </svg>
                          <span className="hidden sm:inline">{t('view_table')}</span>
                        </button>
                      </div>

                      <button
                        onClick={handleExport}
                        className="p-2 md:px-4 md:py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 text-sm whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span className="hidden sm:inline">{t('export_excel')}</span>
                        <span className="sm:hidden">Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Bar (Select/Delete) */}
                  {(logs.length > 0) && (
                    <div className="flex justify-end items-center gap-3 mb-4 px-2 animate-fade-in">
                      {/* Delete Button (Conditional) */}
                      {selectedLogs.size > 0 && (
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium animate-fade-in flex items-center gap-2 whitespace-nowrap"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          {t('delete')} <span className="bg-red-500/20 px-1.5 py-0.5 rounded text-xs">{selectedLogs.size}</span>
                        </button>
                      )}

                      {/* Select All / Deselect All */}
                      <button
                        onClick={toggleSelectAll}
                        className="px-4 py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/10 whitespace-nowrap"
                      >
                        {selectedLogs.size === logs.length ? 'Deselect All' : t('select_all')}
                      </button>
                    </div>
                  )}

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
                                {log.workLink && (
                                  <div className="mt-3">
                                    <a
                                      href={log.workLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                      </svg>
                                      {t('view_work') || 'View Work'}
                                    </a>
                                  </div>
                                )}
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
          </>
        )}
      </div>
    </div>
  );
}
