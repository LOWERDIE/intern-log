import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    hours?: number;
    workLink?: string;
    createdAt: any;
}

interface LogGridProps {
    logs: LogEntry[];
    selectedLogs: Set<string>;
    onToggleSelect: (id: string) => void;
    onView: (log: LogEntry) => void;
}

const LogGrid: React.FC<LogGridProps> = ({ logs, selectedLogs, onToggleSelect, onView }) => {
    const { t, language } = useLanguage();

    if (logs.length === 0) {
        return (
            <div className="text-center py-24 text-slate-500 glass-panel rounded-xl border border-dashed border-slate-700">
                <p className="text-lg font-medium text-slate-400 mb-1">{t('no_logs') || 'No logs found'}</p>
                <p className="text-sm opacity-50">{t('start_adding') || 'Start by adding a new record'}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.map((log) => {
                const isSelected = selectedLogs.has(log.id);
                // Check if it's a holiday (0 hours)
                const isHoliday = log.hours === 0;

                return (
                    <div
                        key={log.id}
                        onClick={() => onView(log)}
                        className={`
                            glass-panel p-5 rounded-xl transition-all cursor-pointer relative group border
                            ${isSelected
                                ? 'bg-[#1e293b] border-blue-500 shadow-md shadow-blue-500/10'
                                : 'bg-[#0f172a] border-white/5 hover:border-slate-600 hover:bg-[#1e293b]'}
                        `}
                    >
                        {/* Date Header */}
                        <h4 className="font-bold text-slate-200 mb-2.5 text-[0.95rem]">
                            {new Date(log.date).toLocaleDateString(language === 'TH' ? 'th-TH' : 'en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h4>

                        {/* Status Badge */}
                        <div className="mb-2.5">
                            {isHoliday ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    {t('status_holiday') || 'Holiday'}
                                </span>
                            ) : log.hours && log.hours < 5 ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-yellow-900 bg-yellow-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-900"></div>
                                    {t('status_work') || 'Work'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    {t('status_work') || 'Work'}
                                </span>
                            )}
                        </div>

                        {/* Hours */}
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{log.hours !== undefined ? log.hours : 8} {t('hours_suffix') || 'hrs.'}</span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-300 text-sm line-clamp-2 min-h-[1.25rem]">
                            {log.description || '-'}
                        </p>

                        {/* Selection Checkbox (Hidden unless selected or group hover, usually top right) */}
                        <div
                            className={`absolute top-4 right-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(log.id)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LogGrid;
