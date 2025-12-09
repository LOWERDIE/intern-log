'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
    userEmail: string | null | undefined;
    onLogout: () => void;
}

export default function Navbar({ userEmail, onLogout }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left Side: Title and Welcome Msg */}
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider">
                        {t('internship_log')}
                    </h1>
                    {userEmail && (
                        <p className="text-slate-400 text-xs mt-0.5 font-thai">
                            {t('welcome_back')}, {userEmail}
                        </p>
                    )}
                </div>

                {/* Desktop Menu (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-slate-300 hover:text-white"
                    >
                        {language === 'TH' ? 'EN' : 'TH'}
                    </button>

                    <button
                        onClick={onLogout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
                    >
                        {t('sign_out')}
                    </button>
                </div>

                {/* Mobile Burger Menu (Visible on Mobile) */}
                <div className="md:hidden relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                    >
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-6 w-48 glass-panel bg-[var(--bg-secondary)]/95 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden animate-fade-in border border-white/10">
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => {
                                        toggleLanguage();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <span className="w-5 h-5 flex items-center justify-center border border-slate-500 rounded text-[10px]">
                                        {language === 'TH' ? 'EN' : 'TH'}
                                    </span>
                                    Switch Language
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onLogout();
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                    </svg>
                                    {t('sign_out')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
