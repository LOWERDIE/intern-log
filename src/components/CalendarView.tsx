'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    hours?: number;
    workLink?: string;
    createdAt: any;
}

interface CalendarViewProps {
    logs: LogEntry[];
    onViewLog: (log: LogEntry) => void;
}

export default function CalendarView({ logs, onViewLog }: CalendarViewProps) {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    // Helper to get day of week for first day (0 = Sunday)
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Group logs by date
    const logsByDate = useMemo(() => {
        const map = new Map<string, LogEntry[]>();
        logs.forEach(log => {
            if (!map.has(log.date)) {
                map.set(log.date, []);
            }
            map.get(log.date)?.push(log);
        });
        return map;
    }, [logs]);

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthNames = [
        t('january') || 'January', t('february') || 'February', t('march') || 'March', t('april') || 'April', t('may') || 'May', t('june') || 'June',
        t('july') || 'July', t('august') || 'August', t('september') || 'September', t('october') || 'October', t('november') || 'November', t('december') || 'December'
    ];

    const weekDays = language === 'TH'
        ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate calendar grid
    const renderCalendarDays = () => {
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-white/5 border border-white/5 opacity-50"></div>);
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayLogs = logsByDate.get(dateStr) || [];
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div
                    key={d}
                    className={`h-24 md:h-32 border border-white/5 p-2 relative group transition-colors ${isToday ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{d}</span>
                        {dayLogs.length > 0 && (
                            <div className="flex gap-1">
                                {dayLogs.map((log, idx) => (
                                    <div
                                        key={log.id}
                                        onClick={() => onViewLog(log)}
                                        className={`w-2 h-2 rounded-full cursor-pointer ${log.hours === 0 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`}
                                        title={`${log.hours} hrs: ${log.description}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tooltip / Preview for first log */}
                    {dayLogs.length > 0 && (
                        <div className="mt-2 text-xs truncate cursor-pointer" onClick={() => onViewLog(dayLogs[0])}>
                            <div className={`px-1.5 py-0.5 rounded border ${dayLogs[0].hours === 0 ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'} truncate`}>
                                {dayLogs[0].hours === 0 ? t('holiday_leave') : `${dayLogs[0].hours} h`}
                            </div>
                            <div className="text-slate-500 mt-1 truncate hidden md:block select-none">
                                {dayLogs[0].description}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/10 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold text-white">
                    {new Date(year, month).toLocaleString(language === 'TH' ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                {weekDays.map((day, i) => (
                    <div key={i} className="p-3 text-center text-sm font-semibold text-slate-400 border-r border-white/5 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 bg-[var(--bg-secondary)] text-slate-100">
                {renderCalendarDays()}
            </div>
        </div>
    );
}
