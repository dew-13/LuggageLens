import React, { useState, useEffect, useCallback } from 'react';
import StaffNavigation from '../components/StaffNavigation';
import apiClient from '../../services/apiClient';

const STATUS_CONFIG = {
    pending_verification: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
    under_review: { label: 'Under Review', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-400' },
    more_info_needed: { label: 'Needs Info', bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-400' },
    verified: { label: 'Verified', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-400' },
    ready_for_dispatch: { label: 'Ready', bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-400' },
    dispatched: { label: 'Dispatched', bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-400' },
    delivered: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
    rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-400' },
};

const NEXT_ACTIONS = {
    pending_verification: ['under_review', 'more_info_needed', 'rejected'],
    under_review: ['verified', 'more_info_needed', 'rejected'],
    more_info_needed: ['under_review'],
    verified: ['ready_for_dispatch'],
    ready_for_dispatch: ['dispatched'],
    dispatched: ['delivered'],
};

const ACTION_LABELS = {
    under_review: '🔍 Start Review',
    more_info_needed: '⚠️ Request Info',
    verified: '✅ Verify Ownership',
    ready_for_dispatch: '📦 Mark Ready',
    dispatched: '🚚 Mark Dispatched',
    delivered: '🎉 Mark Delivered',
    rejected: '❌ Reject Claim',
};

export default function StaffClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [staffNotes, setStaffNotes] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [stats, setStats] = useState(null);

    const fetchClaims = useCallback(async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/staff/claims' : `/staff/claims?status=${filter}`;
            const response = await apiClient.get(url);
            setClaims(response.data.claims || []);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await apiClient.get('/staff/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchClaims();
        fetchStats();
    }, [fetchClaims, fetchStats]);

    const handleStatusUpdate = async (claimId, newStatus) => {
        setActionLoading(true);
        try {
            const body = {
                status: newStatus,
                reviewedBy: 'Staff Member',
            };
            if (staffNotes) body.staffNotes = staffNotes;
            if (trackingNumber && newStatus === 'dispatched') body.dispatchTracking = trackingNumber;

            await apiClient.put(`/staff/claims/${claimId}`, body);
            setStaffNotes('');
            setTrackingNumber('');
            setSelectedClaim(null);
            fetchClaims();
            fetchStats();
        } catch (error) {
            console.error('Error updating claim:', error);
            alert('Failed to update claim: ' + (error.response?.data?.error || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const filterTabs = [
        { key: 'all', label: 'All Claims' },
        { key: 'pending_verification', label: 'Pending' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'verified', label: 'Verified' },
        { key: 'dispatched', label: 'In Transit' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <StaffNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-lg font-bold text-gray-900">Claims Management</h1>
                    <p className="text-gray-600 mt-1 text-sm">Review and process passenger luggage claims.</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">Pending Claims</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.claims?.pending_verification || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">Under Review</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.claims?.under_review || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">Active Found Items</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeFoundItems || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">Resolved</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolvedItems || 0}</p>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === tab.key
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Claims List */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Loading claims...</p>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 font-medium">No claims found</p>
                        <p className="text-gray-400 text-xs mt-1">Claims will appear here when passengers submit them.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {claims.map(claim => {
                            const cfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending_verification;
                            const actions = NEXT_ACTIONS[claim.status] || [];

                            return (
                                <div key={claim.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Images side by side */}
                                            <div className="flex gap-2 flex-shrink-0">
                                                {claim.lost_luggage?.image_url && (
                                                    <div className="relative">
                                                        <img src={claim.lost_luggage.image_url} alt="Lost" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">LOST</span>
                                                    </div>
                                                )}
                                                {claim.found_luggage?.image_url && (
                                                    <div className="relative">
                                                        <img src={claim.found_luggage.image_url} alt="Found" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">FOUND</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Claim details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            {claim.passenger_name || 'Unknown Passenger'}
                                                            {claim.similarity_score && (
                                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal">
                                                                    {Math.round(claim.similarity_score * 100)}% AI Match
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {claim.flight_number && `Flight ${claim.flight_number}`}
                                                            {claim.travel_date && ` • ${new Date(claim.travel_date).toLocaleDateString()}`}
                                                            {' • '}Claimed {new Date(claim.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`flex items-center gap-1 ${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-[10px] font-bold`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        {cfg.label}
                                                    </span>
                                                </div>

                                                {claim.bag_description && (
                                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">"{claim.bag_description}"</p>
                                                )}

                                                {claim.contact_email && (
                                                    <p className="text-[11px] text-gray-400 mt-1">📧 {claim.contact_email} {claim.contact_phone && `• 📱 ${claim.contact_phone}`}</p>
                                                )}

                                                {/* Action buttons */}
                                                {actions.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {actions.map(action => {
                                                            const isDestructive = action === 'rejected';
                                                            return (
                                                                <button
                                                                    key={action}
                                                                    onClick={() => {
                                                                        if (action === 'dispatched') {
                                                                            setSelectedClaim(claim);
                                                                        } else {
                                                                            handleStatusUpdate(claim.id, action);
                                                                        }
                                                                    }}
                                                                    disabled={actionLoading}
                                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-50 ${isDestructive
                                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                                            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                                                                        }`}
                                                                >
                                                                    {ACTION_LABELS[action]}
                                                                </button>
                                                            );
                                                        })}
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

            {/* Dispatch Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedClaim(null)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Dispatch Luggage</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                    placeholder="e.g. DHL-12345678"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Staff Notes (optional)</label>
                                <textarea
                                    rows={2}
                                    value={staffNotes}
                                    onChange={e => setStaffNotes(e.target.value)}
                                    placeholder="Any notes about the dispatch..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => handleStatusUpdate(selectedClaim.id, 'dispatched')}
                                disabled={actionLoading}
                                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : '🚚 Confirm Dispatch'}
                            </button>
                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="px-4 py-2.5 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
