'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogEntry {
    id: string;
    date: string;
    description: string;
    hours?: number;
    workLink?: string;
    createdAt: any;
}

interface EditLogModalProps {
    log: LogEntry | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedLog: LogEntry) => Promise<void>;
}

export default function EditLogModal({ log, isOpen, onClose, onSave }: EditLogModalProps) {
    const { t } = useLanguage();
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [workLink, setWorkLink] = useState('');
    const [hours, setHours] = useState(8);
    const [isCustomHours, setIsCustomHours] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (log) {
            setDate(log.date);
            setDescription(log.description);
            setWorkLink(log.workLink || '');
            const h = log.hours !== undefined ? log.hours : 8;
            setHours(h);
            // Check if hours is standard (8, 4, 0) or custom
            if (h !== 8 && h !== 4 && h !== 0) {
                setIsCustomHours(true);
            } else {
                setIsCustomHours(false);
            }
        }
    }, [log]);

    if (!isOpen || !log) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...log,
                date,
                description,
                workLink,
                hours
            });
            onClose();
        } catch (error) {
            console.error("Failed to update log", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 relative animate-scale-in bg-[var(--bg-secondary)]/95" onClick={(e) => e.stopPropagation()}>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></span>
                    {t('edit_entry') || 'Edit Entry'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('date')}</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full glass-input rounded-xl px-0 py-2.5 text-white text-center"
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
                                            // Keep current hours if switching to custom, or default to 0? 
                                            // Let's keep it if valid, else 0
                                        } else {
                                            setIsCustomHours(false);
                                            setHours(Number(val));
                                        }
                                    }}

                                    className="w-full glass-input rounded-xl px-5 py-3 text-white text-center appearance-none cursor-pointer bg-[var(--bg-secondary)]"
                                >
                                    <option value={8}>8 {t('hours_suffix')}</option>
                                    <option value={4}>4 {t('hours_suffix')}</option>
                                    <option value={0}>{t('holiday_leave')}</option>
                                    <option value="custom">{t('custom')}</option>
                                </select>
                                {isCustomHours && (
                                    <input
                                        type="number"
                                        value={hours}
                                        onChange={(e) => setHours(Number(e.target.value))}
                                        className="w-full max-w-[100px] glass-input rounded-xl px-2 py-3 text-white text-center"
                                        step="0.5"
                                        min="0"
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

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                            disabled={isSaving}
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 btn-primary text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : (t('save_changes') || 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
