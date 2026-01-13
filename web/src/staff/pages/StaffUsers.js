import React, { useState, useEffect } from 'react';
import StaffNavigation from '../components/StaffNavigation';
import UsersList from '../components/UsersList';

export default function StaffUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      // TODO: Replace with actual API call
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          caseCount: 2,
          joinDate: '2025-12-01',
          status: 'active'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
          caseCount: 1,
          joinDate: '2025-12-15',
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage and monitor all registered users.</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users List */}
        <UsersList users={users} />
      </main>
    </div>
  );
}
