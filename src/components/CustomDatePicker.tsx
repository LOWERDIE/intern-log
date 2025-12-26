'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
}

export default function CustomDatePicker({ value, onChange, label }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // For navigating months
    const containerRef = useRef<HTMLDivElement>(null);

    const VIEW_MONTH = viewDate.getMonth();
    const VIEW_YEAR = viewDate.getFullYear();

    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, []); // On mount, set view to current value

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(VIEW_YEAR, VIEW_MONTH - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(VIEW_YEAR, VIEW_MONTH + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(VIEW_YEAR, VIEW_MONTH, day);
        // Format YYYY-MM-DD manually to avoid timezone issues
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const formatDateForDisplay = (isoDate: string) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        return new Intl.DateTimeFormat('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    };

    // Calendar Grid Generation
    const totalDays = daysInMonth(VIEW_YEAR, VIEW_MONTH);
    const startPadding = firstDayOfMonth(VIEW_YEAR, VIEW_MONTH);

    // Previous Month padding days (just for visual filler if needed, but styling usually just emptiness)
    // We will render strict grid cells

    const daysArray = [];
    for (let i = 0; i < startPadding; i++) {
        daysArray.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        daysArray.push(i);
    }

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}

            {/* Trigger Input */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#1e293b] border ${isOpen ? 'border-blue-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white cursor-pointer flex items-center gap-3 transition-colors hover:border-slate-600`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>{value ? formatDateForDisplay(value) : 'Select Date'}</span>
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl p-4 w-[320px] animate-scale-in">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <h3 className="font-semibold text-white">
                            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate)}
                        </h3>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Weekday Labels (Su Mo Tu...) */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {daysArray.map((day, index) => {
                            if (day === null) return <div key={`empty-${index}`} />;

                            // Check if this day is the selected day
                            const isSelected = value &&
                                new Date(value).getDate() === day &&
                                new Date(value).getMonth() === VIEW_MONTH &&
                                new Date(value).getFullYear() === VIEW_YEAR;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
