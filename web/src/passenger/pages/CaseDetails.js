import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PassengerNavigation from '../components/PassengerNavigation';
import apiClient from '../../services/apiClient';
import '../animations.css';

export default function CaseDetails() {
    const { id } = useParams();
    const [caseItem, setCaseItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                const response = await apiClient.get(`/luggage/details/${id}`);
                setCaseItem(response.data);
            } catch (err) {
                console.error('Failed to fetch case details:', err);
                setError('Failed to load case details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCaseDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pl-20 bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !caseItem) {
        return (
            <div className="min-h-screen pt-20 pl-20 bg-black text-white p-8">
                <div className="text-red-500 mb-4">{error || 'Case not found'}</div>
                <Link to="/passenger/cases" className="text-white underline">Back to Cases</Link>
            </div>
        );
    }

    const flightInfo = caseItem.metadata?.flight;
    const lostDate = caseItem.metadata?.lost_date || caseItem.created_at;

    return (
        <div className="min-h-screen relative pt-16 md:pt-20 md:pl-20">
            <PassengerNavigation />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full mb-20 animate-fadeIn">

                {/* Navigation Breadcrumb */}
                <div className="mb-6">
                    <Link to="/passenger/cases" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>←</span> Back to Cases
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Case #{caseItem.id.split('-')[0]}</h1>
                        <p className="text-gray-400 text-sm">Reported on {new Date(caseItem.created_at).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm tracking-wide border ${caseItem.status === 'matched' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            'bg-yellow-500/10 text-yellow-200 border-yellow-500/20'
                        }`}>
                        {caseItem.status.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Visuals */}
                    <div className="space-y-6">
                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                            <img src={caseItem.image_url} alt="Lost Luggage" className="w-full h-auto object-cover max-h-[400px]" />
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">

                        {/* 1. Luggage Details Card */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Luggage Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-400 text-sm block">Description</span>
                                    <p className="text-white">{caseItem.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-400 text-sm block">Color</span>
                                        <p className="text-white capitalize">{caseItem.metadata?.color || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">Brand</span>
                                        <p className="text-white capitalize">{caseItem.metadata?.brand || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">Type</span>
                                        <p className="text-white capitalize">{caseItem.metadata?.type || 'Suitcase'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">Lost Date</span>
                                        <p className="text-white">{new Date(lostDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Flight Details Card */}
                        {flightInfo && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                                <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Flight Information</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <span className="text-gray-400 text-sm block">Passenger Name</span>
                                        <p className="text-white font-mono">{flightInfo.lastName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">Flight Number</span>
                                        <p className="text-white text-lg font-bold">{flightInfo.flightNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">Date of Travel</span>
                                        <p className="text-white">{flightInfo.dateOfTravel}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">From</span>
                                        <p className="text-white">{flightInfo.originAirport}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm block">To</span>
                                        <p className="text-white">{flightInfo.destinationAirport}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
