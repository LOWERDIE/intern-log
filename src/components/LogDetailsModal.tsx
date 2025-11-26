'use client';

import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    createdAt: any;
}

interface LogDetailsModalProps {
    log: LogEntry | null;
    onClose: () => void;
    onEdit: (log: LogEntry) => void;
}

export default function LogDetailsModal({ log, onClose, onEdit }: LogDetailsModalProps) {
    const { t } = useLanguage();

    if (!log) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative border border-white/10 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {t('log_details')}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('date')}</label>
                        <div className="text-xl font-medium text-white">
                            {new Date(log.date).toLocaleDateString('th-TH', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('description')}</label>
                        <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-lg bg-white/5 p-6 rounded-2xl border border-white/5">
                            {log.description}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={() => onEdit(log)}
                        className="px-6 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium transition-all flex items-center gap-2 border border-blue-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t('edit_entry') || 'Edit'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
