import React, { useState, useEffect, useRef } from 'react';

const ThreeDEyes = ({ isClosed = false }) => {
    const [leftEyePos, setLeftEyePos] = useState({ x: 0, y: 0 });
    const [rightEyePos, setRightEyePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // If eyes are closed, don't update position (optional, but looks cleaner if they freeze or reset)
            // We'll let them keep tracking behind the eyelids, or we could reset them.
            // Keeping tracking is fine.

            if (!containerRef.current) return;

            const calcEyePos = (eyeOffset) => {
                const rect = containerRef.current.getBoundingClientRect();
                const eyeX = rect.left + rect.width / 2 + eyeOffset;
                const eyeY = rect.top + rect.height / 2;

                const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
                const distance = Math.min(
                    10, // Max distance pupil can move
                    Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 10
                );

                return {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                };
            };

            setLeftEyePos(calcEyePos(-20)); // Left eye offset
            setRightEyePos(calcEyePos(20));  // Right eye offset
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="flex gap-4 justify-center items-center mb-6">
            {/* Left Eye */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border-2 border-gray-300 relative">
                <div
                    className="w-6 h-6 bg-black rounded-full relative shadow-lg"
                    style={{
                        transform: `translate(${leftEyePos.x}px, ${leftEyePos.y}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-50"></div>
                </div>
                {/* Eyelid */}
                <div
                    className="absolute top-0 left-0 w-full bg-[#a1a1aa] transition-all duration-300 ease-in-out z-10"
                    style={{ height: isClosed ? '100%' : '0%' }}
                />
            </div>

            {/* Right Eye */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border-2 border-gray-300 relative">
                <div
                    className="w-6 h-6 bg-black rounded-full relative shadow-lg"
                    style={{
                        transform: `translate(${rightEyePos.x}px, ${rightEyePos.y}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-50"></div>
                </div>
                {/* Eyelid */}
                <div
                    className="absolute top-0 left-0 w-full bg-[#a1a1aa] transition-all duration-300 ease-in-out z-10"
                    style={{ height: isClosed ? '100%' : '0%' }}
                />
            </div>
        </div>
    );
};

export default ThreeDEyes;
