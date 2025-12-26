import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import CustomDatePicker from './CustomDatePicker';

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
    const [status, setStatus] = useState<'work' | 'holiday'>('work');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [workLink, setWorkLink] = useState('');
    const [hours, setHours] = useState<number | string>(8);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (log) {
            setDate(log.date);
            setDescription(log.description);
            setWorkLink(log.workLink || '');
            const h = log.hours !== undefined ? log.hours : 8;
            setHours(h);
            const isHoliday = h === 0;
            setStatus(isHoliday ? 'holiday' : 'work');
        }
    }, [log]);

    if (!isOpen || !log) return null;

    const handleStatusChange = (newStatus: 'work' | 'holiday') => {
        setStatus(newStatus);
        if (newStatus === 'holiday') {
            setHours(0);
        } else {
            setHours(8); // Default to 8 for work
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                ...log,
                date,
                description,
                workLink,
                workLink,
                hours: Number(hours) || 0
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
            <div className="glass-panel w-full max-w-lg rounded-xl p-6 relative animate-scale-in bg-[#0f172a] border border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {t('edit_entry') || 'Edit Entry'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Date */}
                    <div>
                        <CustomDatePicker
                            label={t('date') || 'Date'}
                            value={date}
                            onChange={setDate}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('status') || 'Status'}</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-left focus:outline-none focus:border-blue-500 transition-colors flex justify-between items-center"
                            >
                                <span>
                                    {status === 'work' ? `💼 ${t('status_work') || 'Work'}` : `✈️ ${t('status_holiday') || 'Holiday / Leave'}`}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {isStatusDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                                            onClick={() => {
                                                handleStatusChange('work');
                                                setIsStatusDropdownOpen(false);
                                            }}
                                        >
                                            <span>💼</span>
                                            <span>{t('status_work') || 'Work'}</span>
                                        </button>
                                        <div className="h-px bg-slate-700/50 my-0"></div>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                                            onClick={() => {
                                                handleStatusChange('holiday');
                                                setIsStatusDropdownOpen(false);
                                            }}
                                        >
                                            <span>✈️</span>
                                            <span>{t('status_holiday') || 'Holiday / Leave'}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hours */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('hours') || 'Hours'}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors no-spinner"
                                step="any"
                                min="0"
                                disabled={status === 'holiday'}
                                onFocus={() => !isDropdownOpen && setIsDropdownOpen(true)}
                            />

                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-white transition-colors"
                                disabled={status === 'holiday'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 text-white hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                            onClick={() => {
                                                setHours(8);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span>{t('hours_suffix') ? `8 ${t('hours_suffix')}` : '8 Hours'}</span>
                                            <span className="text-xs text-slate-500 group-hover:text-slate-300">Default</span>
                                        </button>
                                        <div className="h-px bg-slate-700/50 my-0"></div>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2.5 text-white hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                            onClick={() => {
                                                setHours(4);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span>{t('hours_suffix') ? `4 ${t('hours_suffix')}` : '4 Hours'}</span>
                                            <span className="text-xs text-slate-500 group-hover:text-slate-300">Half Day</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('work_description') || 'Description'}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('placeholder_desc') || "Describe the work done today..."}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white h-24 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* Work Link */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('work_link') || 'Work Link'}</label>
                        <input
                            type="url"
                            value={workLink}
                            onChange={(e) => setWorkLink(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end pt-4 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all font-medium"
                            disabled={isSaving}
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : (t('save_changes') || 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
