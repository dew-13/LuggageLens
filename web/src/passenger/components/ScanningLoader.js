import React from 'react';
import '../animations.css';

const ScanningLoader = ({ message = "Processing AI Analysis..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-500">
            <div className="relative">
                {/* Radar Scanner Effect */}
                <div className="w-32 h-32 md:w-48 md:h-48 border-2 border-green-500/30 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/10 animate-pulse rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-500/0 to-green-500/20 border-b border-green-500/50 animate-[spin_2s_linear_infinite] origin-bottom"></div>
                </div>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
                {message}
            </h2>
            <p className="mt-2 text-green-400 text-sm font-mono tracking-wider">
                Analyzing visual fingerprints...
            </p>
        </div>
    );
};

export default ScanningLoader;
