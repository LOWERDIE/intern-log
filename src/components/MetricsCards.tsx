import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface MetricsCardsProps {
    totalHours: number;
    totalDays: number;
    totalMonths: number;
    daysOff: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ totalHours, totalDays, totalMonths, daysOff }) => {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Hours */}
            <div className="glass-panel p-6 rounded-lg border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all duration-300">
                <div className="absolute top-4 right-4 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-medium mb-1">{t('total_hours') || 'Total Hours'}</h3>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{totalHours}</span>
                    <span className="text-xs text-blue-400">{t('hours_suffix') || 'hrs'}</span>
                </div>
            </div>

            {/* Work Days */}
            <div className="glass-panel p-6 rounded-lg border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all duration-300">
                <div className="absolute top-4 right-4 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-medium mb-1">{t('work_days') || 'Work Days'}</h3>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{totalDays.toFixed(1)}</span>
                    <span className="text-xs text-emerald-400">{t('days_suffix') || 'days'}</span>
                </div>
            </div>

            {/* Months */}
            <div className="glass-panel p-6 rounded-lg border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all duration-300">
                <div className="absolute top-4 right-4 text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-medium mb-1">{t('months') || 'Months'}</h3>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{totalMonths.toFixed(1)}</span>
                    <span className="text-xs text-purple-400">{t('months_suffix') || 'months'}</span>
                </div>
            </div>

            {/* Days Off */}
            <div className="glass-panel p-6 rounded-lg border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all duration-300">
                <div className="absolute top-4 right-4 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </div>
                <h3 className="text-slate-400 text-xs font-medium mb-1">{t('days_off') || 'Days Off'}</h3>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white">{daysOff}</span>
                    <span className="text-xs text-red-400">{t('days_suffix') || 'days'}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricsCards;
