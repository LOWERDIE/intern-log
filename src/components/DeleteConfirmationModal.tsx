'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmationModal({ isOpen, count, onConfirm, onCancel }: DeleteConfirmationModalProps) {
    const { t } = useLanguage();
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const requiredText = t('confirm_keyword');
    const isConfirmed = confirmText === requiredText;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-red-500/20 shadow-2xl shadow-red-900/20">
                <h2 className="text-2xl font-bold mb-4 text-red-400">
                    {t('confirm_delete_title')}
                </h2>

                <p className="text-slate-300 mb-6 leading-relaxed">
                    {t('confirm_delete_msg')} <br />
                    <span className="text-sm text-slate-400 mt-2 block">
                        ({count} {t('selected')})
                    </span>
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {t('type_confirm')}
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={requiredText}
                        className="w-full glass-input rounded-xl px-4 py-3 text-white border-red-500/30 focus:border-red-500/60 focus:shadow-red-500/20"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all ${isConfirmed
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}
