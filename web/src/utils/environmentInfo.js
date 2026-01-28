/**
 * Environment Configuration Display
 * Shows which backend URL is being used
 */

export const getEnvironmentInfo = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = process.env.REACT_APP_API_URL;
    const hostname = window.location.hostname;

    let detectedEnvironment = 'Unknown';
    let expectedBackend = 'Unknown';

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        detectedEnvironment = 'Local Development';
        expectedBackend = 'http://localhost:5000/api';
    } else if (hostname.includes('vercel.app')) {
        detectedEnvironment = 'Vercel Production';
        expectedBackend = apiUrl || 'https://your-backend.onrender.com/api';
    } else {
        detectedEnvironment = 'Custom Deployment';
        expectedBackend = apiUrl || 'http://localhost:5000/api';
    }

    return {
        environment: detectedEnvironment,
        nodeEnv: process.env.NODE_ENV,
        hostname: hostname,
        apiUrl: expectedBackend,
        isProduction: isProduction,
        hasCustomApiUrl: !!apiUrl
    };
};

export const logEnvironmentInfo = () => {
    const info = getEnvironmentInfo();

    console.log('%c🌍 Environment Information', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');
    console.log(`📍 Environment: ${info.environment}`);
    console.log(`🔧 Node ENV: ${info.nodeEnv}`);
    console.log(`🌐 Hostname: ${info.hostname}`);
    console.log(`🔗 API URL: ${info.apiUrl}`);
    console.log(`⚙️  Custom URL: ${info.hasCustomApiUrl ? 'Yes' : 'No (Auto-detected)'}`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');

    return info;
};

export default { getEnvironmentInfo, logEnvironmentInfo };
