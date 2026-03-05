import React, { useEffect } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import '../animations.css';
import useLuggageStore from '../../store/luggageStore';

const STATUS_CONFIG = {
    pending_verification: { label: 'Pending Verification', color: 'yellow', icon: '⏳' },
    under_review: { label: 'Under Review', color: 'blue', icon: '🔍' },
    more_info_needed: { label: 'More Info Needed', color: 'orange', icon: '⚠️' },
    verified: { label: 'Verified', color: 'emerald', icon: '✅' },
    ready_for_dispatch: { label: 'Ready for Dispatch', color: 'cyan', icon: '📦' },
    dispatched: { label: 'Dispatched', color: 'purple', icon: '🚚' },
    delivered: { label: 'Delivered', color: 'green', icon: '🎉' },
    rejected: { label: 'Rejected', color: 'red', icon: '❌' },
};

const getStatusStyle = (status) => {
    const cfg = STATUS_CONFIG[status] || { color: 'gray', label: status };
    const colorMap = {
        yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
        blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        green: 'bg-green-500/10 text-green-300 border-green-500/20',
        red: 'bg-red-500/10 text-red-300 border-red-500/20',
        gray: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    };
    return { className: colorMap[cfg.color], label: cfg.label, icon: cfg.icon };
};

// Progress steps in order
const STEPS = ['pending_verification', 'under_review', 'verified', 'ready_for_dispatch', 'dispatched', 'delivered'];

function getProgressPercentage(status) {
    const idx = STEPS.indexOf(status);
    if (status === 'rejected') return 0;
    if (idx === -1) return 10;
    return Math.round(((idx + 1) / STEPS.length) * 100);
}

export default function MyClaims() {
    const claims = useLuggageStore(state => state.claims);
    const claimLoading = useLuggageStore(state => state.claimLoading);
    const fetchClaims = useLuggageStore(state => state.fetchClaims);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    return (
        <div className="min-h-screen relative pt-16 md:pt-20 md:pl-20">
            <PassengerNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
                {/* Header */}
                <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Claims</h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">Track the status of your luggage claim requests.</p>
                </div>

                {/* Claims List */}
                {claimLoading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
                        <p className="text-gray-400">Loading claims...</p>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="card-animated bg-black/40 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-12 text-center">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-bold text-white mb-2">No Claims Yet</h3>
                        <p className="text-gray-400">When you find a match for your luggage, you can submit a claim from the <a href="/passenger/matches" className="text-blue-400 underline hover:text-blue-300">Matches</a> page.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim, index) => {
                            const statusInfo = getStatusStyle(claim.status);
                            const progress = getProgressPercentage(claim.status);

                            return (
                                <div
                                    key={claim.id}
                                    className="card-animated bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Images */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                {claim.lost_luggage?.image_url && (
                                                    <div className="relative">
                                                        <img src={claim.lost_luggage.image_url} alt="Lost" className="w-20 h-20 object-cover rounded-lg" />
                                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 text-[9px] text-white px-1.5 py-0.5 rounded font-bold">LOST</span>
                                                    </div>
                                                )}
                                                {claim.found_luggage?.image_url && (
                                                    <div className="relative">
                                                        <img src={claim.found_luggage.image_url} alt="Found" className="w-20 h-20 object-cover rounded-lg" />
                                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 text-[9px] text-white px-1.5 py-0.5 rounded font-bold">FOUND</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white">
                                                            Claim #{claim.id?.slice(0, 8)}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Submitted {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.className}`}>
                                                        {statusInfo.icon} {statusInfo.label}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                {claim.status !== 'rejected' && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Progress</span>
                                                            <span className="text-[10px] text-gray-400">{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Flight info */}
                                                <div className="flex flex-wrap gap-3 mt-3">
                                                    {claim.flight_number && (
                                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" /></svg>
                                                            {claim.flight_number}
                                                        </span>
                                                    )}
                                                    {claim.similarity_score && (
                                                        <span className="text-[11px] text-gray-400">
                                                            AI Match: {Math.round(claim.similarity_score * 100)}%
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Staff notes */}
                                                {claim.staff_notes && (
                                                    <div className="mt-3 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                                                        <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Staff Note</p>
                                                        <p className="text-xs text-gray-300">{claim.staff_notes}</p>
                                                    </div>
                                                )}

                                                {/* Tracking */}
                                                {claim.dispatch_tracking && (
                                                    <div className="mt-3 bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                                                        <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider mb-1">Tracking Number</p>
                                                        <p className="text-sm text-white font-mono">{claim.dispatch_tracking}</p>
                                                    </div>
                                                )}

                                                {/* Action for more_info_needed */}
                                                {claim.status === 'more_info_needed' && (
                                                    <div className="mt-3">
                                                        <a
                                                            href={`/passenger/claims/${claim.id}/respond`}
                                                            className="inline-flex items-center gap-1 text-xs text-orange-400 font-semibold hover:text-orange-300 transition-colors"
                                                        >
                                                            Provide additional information →
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
