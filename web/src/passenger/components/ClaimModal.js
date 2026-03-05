import React, { useState } from 'react';
import useLuggageStore from '../../store/luggageStore';
import '../animations.css';

export default function ClaimModal({ match, onClose }) {
    const submitClaim = useLuggageStore(state => state.submitClaim);
    const [formData, setFormData] = useState({
        passengerName: '',
        flightNumber: '',
        travelDate: '',
        bagDescription: '',
        contactEmail: '',
        contactPhone: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const claimData = {
            lostLuggageId: match.lostLuggageId,
            foundLuggageId: match.foundLuggageId,
            similarityScore: match.similarity,
            ...formData
        };

        const response = await submitClaim(claimData);
        setSubmitting(false);

        if (response.success) {
            setResult({ type: 'success', message: 'Claim submitted! Staff will review your request.' });
        } else {
            setResult({ type: 'error', message: response.error });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 shadow-2xl card-animated"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with match preview */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Claim This Luggage</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Match Preview */}
                    <div className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                        <div className="relative flex-shrink-0">
                            <img src={match.foundImage} alt="Found" className="w-20 h-20 object-cover rounded-lg" />
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-8 h-8 flex items-center justify-center">
                                {Math.round(match.similarity * 100)}%
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{match.foundDescription || 'Found luggage item'}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {match.foundColor && (
                                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{match.foundColor}</span>
                                )}
                                {match.foundBagType && (
                                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{match.foundBagType}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success/Error Message */}
                {result && (
                    <div className={`mx-6 mt-4 p-4 rounded-xl text-sm font-medium ${result.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border border-red-500/20'
                        }`}>
                        {result.type === 'success' ? '✅ ' : '❌ '}{result.message}
                        {result.type === 'success' && (
                            <button onClick={onClose} className="block mt-3 text-emerald-400 underline text-xs hover:text-emerald-300">
                                Close & view my claims
                            </button>
                        )}
                    </div>
                )}

                {/* Claim Form */}
                {!result?.type === 'success' || !result ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <p className="text-gray-400 text-xs mb-2">
                            Provide your details so staff can verify your ownership. All fields with * are required.
                        </p>

                        {/* Passenger Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name *</label>
                            <input
                                type="text"
                                name="passengerName"
                                required
                                value={formData.passengerName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Flight & Date row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Flight Number *</label>
                                <input
                                    type="text"
                                    name="flightNumber"
                                    required
                                    value={formData.flightNumber}
                                    onChange={handleChange}
                                    placeholder="EK 502"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Travel Date *</label>
                                <input
                                    type="date"
                                    name="travelDate"
                                    required
                                    value={formData.travelDate}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Bag Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Describe Your Bag *</label>
                            <textarea
                                name="bagDescription"
                                required
                                rows={3}
                                value={formData.bagDescription}
                                onChange={handleChange}
                                placeholder="e.g. Large black Samsonite hardshell suitcase with a red ribbon on the handle..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                            />
                        </div>

                        {/* Contact row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email *</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    required
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    placeholder="you@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting Claim...
                                </span>
                            ) : (
                                'Submit Claim Request'
                            )}
                        </button>
                    </form>
                ) : null}
            </div>
        </div>
    );
}
