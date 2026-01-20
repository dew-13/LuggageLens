import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

/**
 * Quick test component to verify API connectivity
 * Add to App.js temporarily to test: <APITestComponent />
 */
export default function APITestComponent() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    const results = [];

    // Test 1: Backend health
    try {
      const { data } = await apiClient.get('/health');
      results.push({
        name: 'Backend Health Check',
        status: 'PASS',
        message: data?.status || 'Backend is running'
      });
    } catch (error) {
      results.push({
        name: 'Backend Health Check',
        status: 'FAIL',
        message: error.message || 'Could not reach backend'
      });
    }

    // Test 2: API URL Configuration
    try {
      const url = process.env.REACT_APP_API_URL;
      results.push({
        name: 'API URL Configuration',
        status: 'INFO',
        message: `REACT_APP_API_URL = ${url}`
      });
    } catch (error) {
      results.push({
        name: 'API URL Configuration',
        status: 'WARN',
        message: 'Could not read API URL'
      });
    }

    // Test 3: CORS
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin
        }
      });
      results.push({
        name: 'CORS Configuration',
        status: response.ok ? 'PASS' : 'WARN',
        message: `CORS Status: ${response.status}`
      });
    } catch (error) {
      results.push({
        name: 'CORS Configuration',
        status: 'FAIL',
        message: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      backgroundColor: '#fff',
      border: '2px solid #3f51b5',
      borderRadius: '8px',
      padding: '16px',
      width: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 12px 0' }}>API Test</h3>
      <button
        onClick={runTests}
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#3f51b5',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '12px'
        }}
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {testResults.map((result, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '8px',
              padding: '8px',
              backgroundColor:
                result.status === 'PASS'
                  ? '#e8f5e9'
                  : result.status === 'FAIL'
                  ? '#ffebee'
                  : '#e3f2fd',
              borderLeft: `4px solid ${
                result.status === 'PASS'
                  ? '#4caf50'
                  : result.status === 'FAIL'
                  ? '#f44336'
                  : '#2196f3'
              }`,
              borderRadius: '2px'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              {result.status === 'PASS' && '✅'}
              {result.status === 'FAIL' && '❌'}
              {result.status === 'WARN' && '⚠️'}
              {result.status === 'INFO' && 'ℹ️'} {result.name}
            </div>
            <div style={{ marginTop: '4px', color: '#666' }}>
              {result.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
