#!/bin/bash
# Port Forwarding Troubleshooting Script

echo "═════════════════════════════════════════════════════════════"
echo "  BaggageLens Port Forwarding Diagnostics"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Test backend health
echo "🔍 Testing Backend (Port 5000)..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "  ✅ Backend health check: PASS"
    curl -s http://localhost:5000/api/health | json_pp
else
    echo "  ❌ Backend health check: FAIL - Is backend running?"
fi
echo ""

# Test frontend access
echo "🔍 Testing Frontend (Port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ Frontend accessible: PASS"
else
    echo "  ❌ Frontend accessible: FAIL - Is frontend running?"
fi
echo ""

# Test CORS preflight
echo "🔍 Testing CORS Configuration..."
CORS_TEST=$(curl -s -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -i "access-control-allow-origin")

if [ ! -z "$CORS_TEST" ]; then
    echo "  ✅ CORS headers present: PASS"
    echo "    $CORS_TEST"
else
    echo "  ⚠️  CORS headers: Check if present"
fi
echo ""

# Check environment files
echo "🔍 Environment Configuration..."
if [ -f "web/.env" ]; then
    echo "  ✅ Frontend .env found"
    grep "REACT_APP_API_URL" web/.env
else
    echo "  ❌ Frontend .env missing"
fi

if [ -f "backend/.env" ]; then
    echo "  ✅ Backend .env found"
    grep "PORT\|CORS_ORIGIN" backend/.env
else
    echo "  ❌ Backend .env missing"
fi
echo ""

# Summary
echo "═════════════════════════════════════════════════════════════"
echo "  Troubleshooting Summary"
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "If tests failed, check:"
echo "  1. Backend: npm start in e:\\Projects\\BaggageLens\\backend"
echo "  2. Frontend: npm start in e:\\Projects\\BaggageLens\\web"
echo "  3. .env files have correct REACT_APP_API_URL"
echo "  4. No firewall blocking ports 3000/5000"
echo ""
