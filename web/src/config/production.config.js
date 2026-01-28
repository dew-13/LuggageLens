/**
 * Production Configuration
 * Update this file with your actual Render backend URL
 * This is used as a fallback when REACT_APP_API_URL is not set
 */

export const PRODUCTION_CONFIG = {
    // Your actual Render backend URL
    BACKEND_URL: 'https://luggagelens.onrender.com/api',

    // Or if you have multiple environments:
    STAGING_URL: 'https://luggagelens.onrender.com/api',
    PRODUCTION_URL: 'https://luggagelens.onrender.com/api',
};

// Auto-select based on hostname
export const getProductionBackendUrl = () => {
    const hostname = window.location.hostname;

    // Check for staging environment
    if (hostname.includes('staging')) {
        return PRODUCTION_CONFIG.STAGING_URL;
    }

    // Default to production
    return PRODUCTION_CONFIG.PRODUCTION_URL || PRODUCTION_CONFIG.BACKEND_URL;
};

export default PRODUCTION_CONFIG;
