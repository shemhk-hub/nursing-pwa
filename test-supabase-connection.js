#!/usr/bin/env node

/**
 * Supabase Connection Validation Script
 * Tests the Supabase API connectivity and auth endpoints
 */

const https = require('https');
const url = require('url');

const SUPABASE_URL = 'https://uiakghpvtayplyuaxzyh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYWtnaHB2dGF5cGx5dWF4enloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTYyOTQsImV4cCI6MjA5NDUzMjI5NH0.Mg-1Hqt8LxkFEhL8aSZ0vn5fXnRHOg4X4jmPsrNe7_w';

console.log('🔍 Supabase Connection Validation\n');
console.log(`📍 Project URL: ${SUPABASE_URL}`);
console.log(`🔑 API Key: ${SUPABASE_KEY.substring(0, 20)}...`);
console.log('\n-----------------------------------\n');

// Test 1: Check if Supabase URL is accessible
console.log('Test 1: Checking Supabase URL accessibility...');
const testUrl = `${SUPABASE_URL}/rest/v1/`;

https.get(testUrl, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  },
  timeout: 5000
}, (res) => {
  console.log(`✅ URL is accessible (HTTP ${res.statusCode})`);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      console.log(`📦 Response preview: ${data.substring(0, 100)}...`);
    } catch (e) {
      console.log('Response received');
    }
  });
}).on('error', (err) => {
  console.log(`❌ Error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.log('   → Supabase service may be down or unreachable');
  } else if (err.code === 'ENOTFOUND') {
    console.log('   → Domain not found - check the Supabase URL');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('   → Request timed out - network or service issue');
  }
});

// Test 2: Test Auth endpoint
console.log('\nTest 2: Testing Auth signup endpoint...');

const authPayload = JSON.stringify({
  email: 'test@example.com',
  password: 'TestPassword123!',
  data: { full_name: 'Test User' }
});

const authOptions = {
  hostname: 'uiakghpvtayplyuaxzyh.supabase.co',
  port: 443,
  path: '/auth/v1/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(authPayload),
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  },
  timeout: 10000
};

const authReq = https.request(authOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Auth endpoint status: HTTP ${res.statusCode}`);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Auth signup endpoint is working!');
      try {
        const response = JSON.parse(body);
        console.log(`📝 User created: ${response.user?.email}`);
      } catch (e) {
        console.log('Response received successfully');
      }
    } else if (res.statusCode === 400) {
      console.log('⚠️  Bad request (400) - check request format');
      try {
        const error = JSON.parse(body);
        console.log(`   Error: ${error.error_description || error.message}`);
      } catch (e) {
        console.log(`   Response: ${body.substring(0, 100)}`);
      }
    } else if (res.statusCode === 422) {
      console.log('⚠️  Unprocessable entity (422) - user may already exist');
      try {
        const error = JSON.parse(body);
        console.log(`   Error: ${error.error_description || error.message}`);
      } catch (e) {
        console.log(`   Response: ${body.substring(0, 100)}`);
      }
    } else {
      console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
      try {
        const error = JSON.parse(body);
        console.log(`   Error: ${error.error_description || error.message || body.substring(0, 100)}`);
      } catch (e) {
        console.log(`   Response: ${body.substring(0, 200)}`);
      }
    }
  });
});

authReq.on('error', (err) => {
  console.log(`❌ Error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.log('   → Auth service may be down');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('   → Auth request timed out');
  }
});

authReq.on('timeout', () => {
  console.log('❌ Request timeout - service not responding');
  authReq.destroy();
});

authReq.write(authPayload);
authReq.end();

// Test 3: Check project health endpoint
console.log('\nTest 3: Checking project health...');

https.get(`${SUPABASE_URL}/`, {
  headers: { 'apikey': SUPABASE_KEY },
  timeout: 5000
}, (res) => {
  console.log(`✅ Project base URL accessible (HTTP ${res.statusCode})`);
}).on('error', (err) => {
  console.log(`⚠️  Project base URL error: ${err.message}`);
});

// Summary
console.log('\n-----------------------------------');
console.log('📌 Diagnostic Summary:\n');
console.log('If tests show:');
console.log('  ✅ All passing → Supabase is working, issue may be app-specific');
console.log('  ❌ Auth endpoint failing → Check auth configuration in Supabase');
console.log('  ⚠️  Timeouts → Check Supabase project status (may be paused)');
console.log('  ❌ Connection refused → Supabase service may be down\n');
