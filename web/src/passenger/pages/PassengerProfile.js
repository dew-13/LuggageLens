import React, { useState } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import useAuthStore from '../../store/authStore';
import apiClient from '../../services/apiClient';
import '../animations.css';

import baggageClaimImage from '../../images/baggage claim.jpg';

export default function PassengerProfile() {
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (status.type === 'error') setStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            setStatus({ type: 'error', message: 'All fields are required' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'New password must be at least 6 characters' });
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setIsSubmitting(true);

        try {
            await apiClient.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update password';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="min-h-screen pt-16 relative"
            style={{
                backgroundImage: `url('${baggageClaimImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay for better text readability */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(16, 46, 74, 0.9)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            <PassengerNavigation />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 card-animated">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                                <div className="text-gray-900 font-medium">{user?.email || 'Loading...'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                                <div className="text-gray-900 capitalize">{user?.role || 'Passenger'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden card-animated" style={{ animationDelay: '0.1s' }}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>

                        {status.message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="form-input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="form-input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        className="form-input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-animated px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
