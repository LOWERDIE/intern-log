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
                <p className="text-lg">{t('no_logs')}</p>
                <p className="text-sm opacity-60">{t('start_adding')}</p>
            </div>
        );
    }

    const allSelected = logs.length > 0 && selectedIds.size === logs.length;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="p-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onSelectAll}
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                                />
                            </th>
                            <th className="p-4 font-semibold">{t('date')}</th>
                            <th className="p-4 font-semibold">{t('description')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => {
                            const isSelected = selectedIds.has(log.id);
                            return (
                                <tr
                                    key={log.id}
                                    onClick={() => onView(log)}
                                    className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(log.id)}
                                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                                        />
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-blue-300 font-medium">
                                        {new Date(log.date).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}
                                        {log.hours === 0 && (
                                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                                {t('holiday_leave')}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`p-4 whitespace-pre-wrap min-w-[300px] line-clamp-2 ${log.hours === 0 ? 'text-red-300' : 'text-slate-300'}`}>
                                        {log.description.length > 100 ? log.description.substring(0, 100) + '...' : log.description}
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
