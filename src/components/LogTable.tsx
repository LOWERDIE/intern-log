'use client';

import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    workLink?: string;
    hours?: number;
    createdAt: any;
}

interface LogTableProps {
    logs: LogEntry[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
    onView: (log: LogEntry) => void;
}

export default function LogTable({ logs, selectedIds, onToggleSelect, onSelectAll, onView }: LogTableProps) {
    const { t } = useLanguage();

    if (logs.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500 glass-panel rounded-3xl border-dashed border-2 border-slate-700">
                <p className="text-lg">{t('no_logs') || 'No logs'}</p>
                <p className="text-sm opacity-60">{t('start_adding') || 'Start adding'}</p>
            </div>
        );
    }

    const allSelected = logs.length > 0 && selectedIds.size === logs.length;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <th className="p-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                                />
                            </th>
                            <th className="p-4">{t('date') || 'Date'}</th>
                            <th className="p-4">{t('status') || 'Status'}</th>
                            <th className="p-4">{t('hours') || 'Hours'}</th>
                            <th className="p-4 max-w-xs">{t('description') || 'Description'}</th>
                            <th className="p-4">{t('link') || 'Link'}</th>
                            <th className="p-4 text-right">{t('actions') || 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => {
                            const isSelected = selectedIds.has(log.id);
                            return (
                                <tr
                                    key={log.id}
                                    onClick={() => onView(log)}
                                    className={`transition-colors cursor-pointer group ${isSelected ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(log.id)}
                                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                                        />
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">
                                                {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {log.hours === 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md shadow-red-500/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                                </svg>
                                                {t('holiday_leave') || 'Holiday'}
                                            </span>
                                        ) : log.hours && log.hours < 5 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-500/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                </svg>
                                                {t('status_work') || 'Work'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                                </svg>
                                                {t('work') || 'Work'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-sm font-medium text-slate-300">
                                        {log.hours !== undefined ? log.hours : 8} {t('hours_suffix') || 'hrs'}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400 max-w-xs truncate">
                                        {log.description}
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-sm text-slate-400">
                                        {log.workLink ? (
                                            <a
                                                href={log.workLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                            >
                                                Link
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit"
                                                // Event bubbles up to row click which opens view, need separate handler if we want edit directly
                                                onClick={(e) => { e.stopPropagation(); onView(log); }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                </svg>
                                            </button>
                                            <button
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Trigger delete logic? For now we just select it to delete via bulk or we need a delete prop
                                                    onToggleSelect(log.id);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
