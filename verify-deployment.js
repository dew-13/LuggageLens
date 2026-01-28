#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests both local and production configurations
 */

const https = require('https');
const http = require('http');

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = (color, message) => console.log(`${COLORS[color]}${message}${COLORS.reset}`);

const testEndpoint = (url, name) => {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;

        log('cyan', `\n🔍 Testing ${name}...`);
        log('blue', `   URL: ${url}`);

        const startTime = Date.now();

        protocol.get(url, (res) => {
            const duration = Date.now() - startTime;
            let data = '';

            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    log('green', `   ✅ Success (${duration}ms)`);
                    log('green', `   Response: ${data}`);
                    resolve(true);
                } else {
                    log('red', `   ❌ Failed with status ${res.statusCode}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            const duration = Date.now() - startTime;
            log('red', `   ❌ Error (${duration}ms): ${err.message}`);
            resolve(false);
        }).setTimeout(30000, () => {
            log('yellow', `   ⚠️  Timeout (30s) - Backend may be sleeping (Render free tier)`);
            resolve(false);
        });
    });
};

const main = async () => {
    log('cyan', '\n═══════════════════════════════════════════════════════');
    log('cyan', '   BaggageLens Deployment Verification');
    log('cyan', '═══════════════════════════════════════════════════════\n');

    const results = {
        localBackend: false,
        productionBackend: false,
    };

    // Test Local Backend
    log('yellow', '📍 Testing Local Environment...');
    results.localBackend = await testEndpoint('http://localhost:5000/health', 'Local Backend');

    // Test Production Backend
    log('yellow', '\n📍 Testing Production Environment...');
    results.productionBackend = await testEndpoint('https://luggagelens.onrender.com/health', 'Production Backend (Render)');

    // Summary
    log('cyan', '\n═══════════════════════════════════════════════════════');
    log('cyan', '   Summary');
    log('cyan', '═══════════════════════════════════════════════════════\n');

    if (results.localBackend) {
        log('green', '✅ Local Backend: Running');
    } else {
        log('yellow', '⚠️  Local Backend: Not running (start with: cd backend && npm start)');
    }

    if (results.productionBackend) {
        log('green', '✅ Production Backend: Running');
    } else {
        log('red', '❌ Production Backend: Not accessible');
    }

    log('cyan', '\n═══════════════════════════════════════════════════════');
    log('cyan', '   Next Steps');
    log('cyan', '═══════════════════════════════════════════════════════\n');

    if (!results.localBackend) {
        log('yellow', '1. Start local backend: cd backend && npm start');
    }

    if (!results.productionBackend) {
        log('yellow', '2. Check Render dashboard: https://dashboard.render.com/');
        log('yellow', '3. Verify backend is deployed and running');
    }

    if (results.localBackend && results.productionBackend) {
        log('green', '🎉 All systems operational!');
        log('green', '   Ready to develop locally and deploy to production.');
    }

    console.log('');
};

main();
