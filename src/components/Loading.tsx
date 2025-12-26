import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden">
            {/* Animated Background Elements - Matching Dashboard */}
            <div className="animated-bg"></div>

            {/* Spinner Container */}
            <div className="relative mb-8 z-10">
                {/* Outer Ring */}
                <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-blue-500 border-r-blue-500/50 animate-[spin_1s_linear_infinite] shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>

                {/* Middle Ring */}
                <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-white/5 border-b-purple-500 border-l-purple-500/50 animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>

                {/* Inner Ring */}
                <div className="absolute top-5 left-5 w-10 h-10 rounded-full border-4 border-white/5 border-t-pink-500 animate-[spin_2s_linear_infinite]"></div>

                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Text */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <h2 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
                    LOADING
                </h2>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
