import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse delay-75"></div>

            {/* Spinner Container */}
            <div className="relative mb-8">
                {/* Outer Ring */}
                <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-emerald-400 border-r-emerald-400/50 animate-[spin_1s_linear_infinite] shadow-[0_0_20px_rgba(52,211,153,0.3)]"></div>

                {/* Middle Ring */}
                <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-white/5 border-b-blue-500 border-l-blue-500/50 animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>

                {/* Inner Ring */}
                <div className="absolute top-5 left-5 w-10 h-10 rounded-full border-4 border-white/5 border-t-purple-500 animate-[spin_2s_linear_infinite]"></div>

                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Text */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <h2 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-pulse">
                    LOADING
                </h2>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
