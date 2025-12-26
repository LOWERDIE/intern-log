import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    hours?: number;
    workLink?: string;
}

interface LogCalendarProps {
    logs: LogEntry[];
    onView: (log: LogEntry) => void;
}

const LogCalendar: React.FC<LogCalendarProps> = ({ logs, onView }) => {
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Simple calendar logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCalendarDays = () => {
        const days = [];

        // Previous month days
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: prevMonthDays - firstDay + 1 + i, type: 'prev' });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, type: 'current' });
        }

        // Next month days (fill up to 42 for 6 rows)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, type: 'next' });
        }

        return days;
    };

    const calendarLogs = (day: number) => {
        if (!logs) return null;
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return logs.find(l => l.date === dateStr);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h3 className="text-lg font-bold text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-sm font-medium text-slate-500 py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((item, index) => {
                        const log = item.type === 'current' ? calendarLogs(item.day) : null;

                        let bgClass = '';
                        let textClass = '';
                        let dotClass = '';

                        if (log) {
                            if (log.hours === 0) {
                                bgClass = 'bg-red-500/10';
                                textClass = 'text-red-500';
                                dotClass = 'bg-red-500';
                            } else if ((log.hours || 0) < 5) {
                                bgClass = 'bg-yellow-500/10';
                                textClass = 'text-yellow-500';
                                dotClass = 'bg-yellow-500';
                            } else {
                                bgClass = 'bg-blue-500/10';
                                textClass = 'text-blue-500';
                                dotClass = 'bg-blue-500';
                            }
                        }

                        return (
                            <div
                                key={index}
                                className={`
                                    h-12 rounded-xl flex items-center justify-center text-sm font-medium relative group cursor-pointer transition-colors
                                    ${item.type === 'current' ? 'text-white hover:bg-white/5' : 'text-slate-600'}
                                    ${bgClass} ${textClass}
                                    ${item.day === new Date().getDate() && item.type === 'current' && new Date().getMonth() === currentDate.getMonth() ? 'border border-blue-500' : ''}
                                `}
                                onClick={() => log && onView(log)}
                            >
                                {item.day}
                                {log && (
                                    <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4 mt-6 text-xs text-slate-400 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Work
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div> &lt; 5 Hrs
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Holiday
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="glass-panel p-6 rounded-3xl h-full">
                    <h3 className="text-lg font-bold mb-4">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>

                    {/* Preview of selected day or today ? For now just static example or empty state if no log selected logic passed yet */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Work
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            8 hrs
                        </div>
                        <p className="text-sm text-slate-300">
                            shshhh
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogCalendar;
