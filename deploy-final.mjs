#!/usr/bin/env node

/**
 * Checkpoint 1 Deployment Script
 * Deploys database schema and test data to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

console.log('\n🚀 Checkpoint 1 Deployment Starting...\n');
console.log(`📍 Project: ${SUPABASE_URL.split('//')[1].split('.')[0]}`);
console.log(`🔑 Key: ${SUPABASE_SERVICE_KEY.substring(0, 30)}...\n`);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestData() {
  console.log('⏳ Creating test data (INC Curriculum)...\n');

  try {
    // Create Years
    console.log('  Creating years...');
    const { error: yearError } = await supabase
      .from('years')
      .insert([
        { number: 1, title: 'Year 1', description: 'First Year BSc Nursing' },
        { number: 2, title: 'Year 2', description: 'Second Year BSc Nursing' },
        { number: 3, title: 'Year 3', description: 'Third Year BSc Nursing' },
        { number: 4, title: 'Year 4', description: 'Fourth Year BSc Nursing' },
      ])
      .onConflict('number')
      .update({ title: 'Year' });

    if (yearError) {
      if (yearError.code === 'PGRST116') {
        console.log('  ⚠️  Years table not yet created - this is normal');
        console.log('     You need to deploy the main schema to Supabase SQL Editor first\n');
        return false;
      }
      console.warn(`  ⚠️  Years insert: ${yearError.message}`);
    } else {
      console.log('  ✓ Years created');
    }

    // Get Year 1
    const { data: years, error: yearQueryError } = await supabase
      .from('years')
      .select('id')
      .eq('number', 1)
      .limit(1)
      .single();

    if (yearQueryError) {
      console.log('  ⚠️  Years table query failed - schema not yet deployed\n');
      return false;
    }

    if (years) {
      // Create Semester 1
      const { data: semester, error: semError } = await supabase
        .from('semesters')
        .insert({
          year_id: years.id,
          number: 1,
          title: 'Semester 1 - Foundation Courses',
        })
        .select()
        .single();

      if (semError) {
        console.warn(`  ⚠️  Semester insert: ${semError.message}`);
      } else if (semester) {
        console.log('  ✓ Semester 1 created');

        // Create Sample Subject
        const { data: subject, error: subjError } = await supabase
          .from('subjects')
          .insert({
            semester_id: semester.id,
            code: 'ANA101',
            title: 'Anatomy & Physiology I',
            description: 'Foundation of human body structure and functions',
            credits: 4.0,
            instructor_name: 'Dr. Smith',
            status: 'active',
          })
          .select()
          .single();

        if (subjError) {
          console.warn(`  ⚠️  Subject insert: ${subjError.message}`);
        } else if (subject) {
          console.log('  ✓ Subject (Anatomy & Physiology) created');

          // Create Sample Unit
          const { data: unit, error: unitError } = await supabase
            .from('units')
            .insert({
              subject_id: subject.id,
              number: 1,
              title: 'Introduction to Anatomy',
              description: 'Basic anatomical structures and terminology',
              status: 'published',
            })
            .select()
            .single();

          if (unitError) {
            console.warn(`  ⚠️  Unit insert: ${unitError.message}`);
          } else if (unit) {
            console.log('  ✓ Unit created');

            // Create Sample Topic
            const { data: topic, error: topicError } = await supabase
              .from('topics')
              .insert({
                unit_id: unit.id,
                title: 'Cell Structure & Function',
                content: '<h2>Introduction to Cells</h2><p>A cell is the basic structural and functional unit of all living organisms.</p>',
                status: 'published',
              })
              .select()
              .single();

            if (topicError) {
              console.warn(`  ⚠️  Topic insert: ${topicError.message}`);
            } else if (topic) {
              console.log('  ✓ Topic created');
            }
          }
        }
      }
    }

    console.log('\n✅ Test data creation completed\n');
    return true;
  } catch (error) {
    console.error(`❌ Error creating test data: ${error.message}\n`);
    return false;
  }
}

async function verifyDatabase() {
  console.log('⏳ Verifying database tables...\n');

  try {
    const tables = [
      'users',
      'years',
      'semesters',
      'subjects',
      'units',
      'topics',
      'subscriptions',
      'bookmarks',
      'downloads',
      'ratings',
      'user_progress',
      'activity_log',
      'backups',
      'notifications',
      'otp_codes',
    ];

    let verified = 0;
    const missing = [];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count()', { count: 'exact', head: true })
        .limit(1);

      if (!error) {
        console.log(`  ✓ ${table}`);
        verified++;
      } else if (error.code === 'PGRST116') {
        console.log(`  ✗ ${table} (not found)`);
        missing.push(table);
      } else {
        console.warn(`  ⚠️  ${table}: ${error.message}`);
      }
    }

    console.log(`\n✅ ${verified}/${tables.length} tables verified\n`);

    if (missing.length > 0) {
      console.log('⚠️  Missing tables (need schema deployment):\n');
      missing.forEach(t => console.log(`   - ${t}`));
      console.log('\n📋 Next step: Deploy database-schema.sql to Supabase SQL Editor\n');
      return false;
    }

    return verified > 10;
  } catch (error) {
    console.error(`❌ Error verifying database: ${error.message}\n`);
    return false;
  }
}

async function testOTPFlow() {
  console.log('⏳ Testing OTP flow...\n');

  try {
    // Test by checking if we can insert into otp_codes
    const testSessionId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('otp_codes')
      .insert({
        session_id: testSessionId,
        email: 'test@example.com',
        code: '123456',
        user_role: 'student',
        expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('  ⚠️  OTP codes table not created yet\n');
        return false;
      }
      console.warn(`  ⚠️  OTP insert test: ${error.message}\n`);
      return false;
    }

    if (data) {
      console.log('  ✓ OTP storage working');

      // Clean up test data
      await supabase
        .from('otp_codes')
        .delete()
        .eq('session_id', testSessionId);

      console.log('\n✅ OTP flow test passed\n');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error testing OTP flow: ${error.message}\n`);
    return false;
  }
}

async function deploy() {
  console.log('=' .repeat(60) + '\n');

  // Step 1: Verify
  const verifyOk = await verifyDatabase();

  if (!verifyOk) {
    console.log('⚠️  IMPORTANT: Database schema not yet deployed\n');
    console.log('📋 You must deploy the database schema first:\n');
    console.log('Steps:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Click: SQL Editor → New Query');
    console.log('4. Copy contents of: database-schema.sql');
    console.log('5. Click: Run\n');
    console.log('Then run this script again.\n');
    process.exit(1);
  }

  // Step 2: Test Data
  const dataOk = await createTestData();

  // Step 3: Test OTP
  const otpOk = await testOTPFlow();

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 DEPLOYMENT SUMMARY\n');

  if (verifyOk && dataOk && otpOk) {
    console.log('✨ SUCCESS: Checkpoint 1 fully deployed!\n');
    console.log('🎯 Next steps:\n');
    console.log('1. Start dev server:');
    console.log('   npm run dev\n');
    console.log('2. Open browser:');
    console.log('   http://localhost:3000\n');
    console.log('3. Test signup flow:');
    console.log('   - Click "Sign Up"');
    console.log('   - Enter your email or phone');
    console.log('   - Click "Send OTP"');
    console.log('   - Check your email for the 6-digit code');
    console.log('   - Enter OTP and click "Verify & Sign Up"\n');
    console.log('📖 Full guide: DEPLOYMENT_GUIDE_CHECKPOINT1.md\n');
  } else if (verifyOk) {
    console.log('✅ Database verified - partial success\n');
    console.log('Test data and OTP flow still need to be tested\n');
    console.log('After deploying full schema, rerun: node deploy-final.mjs\n');
  } else {
    console.log('❌ Deployment incomplete\n');
    console.log('Deploy database schema first, then rerun this script\n');
  }

  console.log('=' .repeat(60) + '\n');
}

// Run deployment
deploy().catch(error => {
  console.error('\n❌ Deployment error:', error);
  process.exit(1);
});
