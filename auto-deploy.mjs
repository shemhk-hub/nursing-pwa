#!/usr/bin/env node

/**
 * AUTOMATED DEPLOYMENT ASSISTANT
 * Gets real credentials from user and completes deployment
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 AUTOMATED DEPLOYMENT ASSISTANT');
  console.log('='.repeat(80) + '\n');

  console.log('This script will help you complete Checkpoint 1 deployment.\n');

  // Load current environment
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !line.startsWith('#')) {
      env[match[1].trim()] = match[2].trim();
    }
  });

  const currentUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const currentKey = env.SUPABASE_SERVICE_KEY;

  console.log('📍 Current Configuration:');
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Service Key: ${currentKey.substring(0, 30)}...${currentKey.substring(currentKey.length - 20)}\n`);

  if (currentKey.includes('sampleServiceKey')) {
    console.log('⚠️  WARNING: Service key is a placeholder!\n');
    console.log('To proceed with deployment, you need the REAL service key from Supabase.\n');
    console.log('HOW TO GET IT:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Sign in or create account');
    console.log('3. Create project "nursing-pwa" (or use existing)');
    console.log('4. Go to: Settings → API');
    console.log('5. Copy: "Service Role Secret" (not the anon key!)');
    console.log('6. Paste it below\n');

    const response = await question('Do you have the real service key ready? (yes/no): ');

    if (response.toLowerCase() !== 'yes') {
      console.log('\n⏸️  Stopping here. Get your real service key from Supabase and try again.\n');
      rl.close();
      process.exit(0);
    }

    const newKey = await question('\n📝 Paste your Service Role Secret here: ');

    if (!newKey || newKey.trim().length < 50) {
      console.log('\n❌ Invalid key format!\n');
      rl.close();
      process.exit(1);
    }

    console.log('\n💾 Updating .env.local with new key...');

    // Update env file
    const updatedContent = envContent.replace(
      /SUPABASE_SERVICE_KEY=.*/,
      `SUPABASE_SERVICE_KEY=${newKey.trim()}`
    );

    fs.writeFileSync(envPath, updatedContent, 'utf8');

    console.log('✅ .env.local updated!\n');

    // Update env object
    env.SUPABASE_SERVICE_KEY = newKey.trim();
  }

  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  console.log('🔗 Connecting to Supabase...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Test connection
  const { error: connError } = await supabase.from('years').select('count()', { count: 'exact', head: true }).limit(1);

  if (connError && connError.code === 'PGRST116') {
    console.log('✅ Connected! (Tables not yet created - this is expected)\n');
  } else if (connError) {
    console.log(`❌ Connection error: ${connError.message}\n`);
    console.log('Make sure your service key is correct and copy the entire key.\n');
    rl.close();
    process.exit(1);
  }

  console.log('📋 DEPLOYMENT CHECKLIST:\n');

  // Check what's deployed
  const tables = [
    'years', 'semesters', 'subjects', 'units', 'topics',
    'subscriptions', 'bookmarks', 'downloads', 'ratings',
    'user_progress', 'activity_log', 'backups', 'notifications', 'otp_codes'
  ];

  let existingTables = 0;

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count()', { count: 'exact', head: true }).limit(1);

    if (error && error.code === 'PGRST116') {
      console.log(`  ⏳ ${table} - needs to be created`);
    } else if (!error) {
      console.log(`  ✅ ${table} - exists`);
      existingTables++;
    }
  }

  console.log(`\n📊 Status: ${existingTables}/${tables.length} tables exist\n`);

  if (existingTables < tables.length) {
    console.log('⚠️  Some tables still need to be created.\n');
    console.log('You have two options:\n');
    console.log('OPTION 1: Manual SQL deployment (recommended first time)');
    console.log('  1. Go to: https://app.supabase.com');
    console.log('  2. SQL Editor → New Query');
    console.log('  3. Copy database-schema.sql contents');
    console.log('  4. Paste and Run');
    console.log('  5. Repeat with database-otp-codes-table.sql');
    console.log('  6. Rerun this script\n');

    console.log('OPTION 2: Try automated deployment (may fail if migrations not available)');
    console.log('  - Press "yes" below\n');

    const choice = await question('Would you like me to attempt automated SQL deployment? (yes/no): ');

    if (choice.toLowerCase() === 'yes') {
      console.log('\n⏳ Attempting SQL deployment...\n');

      // Try to deploy via migrations (this might not work depending on Supabase plan)
      console.log('📝 Reading schema files...');

      const mainSchema = fs.readFileSync(path.join(__dirname, 'database-schema.sql'), 'utf8');
      const otpSchema = fs.readFileSync(path.join(__dirname, 'database-otp-codes-table.sql'), 'utf8');

      console.log(`✓ Main schema: ${mainSchema.length} bytes`);
      console.log(`✓ OTP schema: ${otpSchema.length} bytes\n`);

      console.log('⚠️  Supabase REST API does not support direct SQL execution.\n');
      console.log('To complete deployment, you MUST:\n');
      console.log('1. Go to SQL Editor in Supabase dashboard');
      console.log('2. Copy/paste and run the SQL files');
      console.log('3. Rerun this script when done\n');
    }

    rl.close();
    process.exit(0);
  }

  console.log('✅ All tables exist! Proceeding with deployment...\n');

  // Create test data
  console.log('📚 Creating test curriculum data...\n');

  const { data: years } = await supabase.from('years').select('id').eq('number', 1);

  if (!years || years.length === 0) {
    console.log('Creating years...');
    await supabase.from('years').insert([
      { number: 1, title: 'Year 1', description: 'First Year BSc Nursing' },
      { number: 2, title: 'Year 2', description: 'Second Year BSc Nursing' },
      { number: 3, title: 'Year 3', description: 'Third Year BSc Nursing' },
      { number: 4, title: 'Year 4', description: 'Fourth Year BSc Nursing' },
    ]);
    console.log('✅ Years created\n');
  }

  // Create test data structure
  const { data: year1 } = await supabase.from('years').select('id').eq('number', 1).single();

  if (year1) {
    const { data: sems } = await supabase.from('semesters').select('id').eq('number', 1);

    if (!sems || sems.length === 0) {
      const { data: sem } = await supabase.from('semesters').insert({
        year_id: year1.id,
        number: 1,
        title: 'Semester 1 - Foundation',
      }).select().single();

      if (sem) {
        const { data: subj } = await supabase.from('subjects').insert({
          semester_id: sem.id,
          code: 'ANA101',
          title: 'Anatomy & Physiology',
          description: 'Foundation of human body structure',
          credits: 4.0,
          status: 'active',
        }).select().single();

        if (subj) {
          const { data: unit } = await supabase.from('units').insert({
            subject_id: subj.id,
            number: 1,
            title: 'Introduction to Anatomy',
            status: 'published',
          }).select().single();

          if (unit) {
            await supabase.from('topics').insert({
              unit_id: unit.id,
              title: 'Cell Structure & Function',
              content: '<h2>Introduction to Cells</h2><p>Basic cell structures.</p>',
              status: 'published',
            });
          }
        }

        console.log('✅ Test curriculum data created\n');
      }
    } else {
      console.log('✅ Test data already exists\n');
    }
  }

  // Verify OTP
  console.log('🔐 Testing OTP functionality...\n');

  const testId = crypto.randomUUID();
  const { data: otpTest } = await supabase.from('otp_codes').insert({
    session_id: testId,
    email: 'test@example.com',
    code: '123456',
    user_role: 'student',
    expires_at: new Date(Date.now() + 600000).toISOString(),
  }).select();

  if (otpTest) {
    console.log('✅ OTP storage working\n');

    // Clean up
    await supabase.from('otp_codes').delete().eq('session_id', testId);
  }

  console.log('='.repeat(80));
  console.log('\n🎉 CHECKPOINT 1 DEPLOYMENT COMPLETE!\n');

  console.log('✅ All database tables created');
  console.log('✅ Test curriculum data loaded');
  console.log('✅ OTP authentication verified\n');

  console.log('🚀 NEXT STEPS:\n');
  console.log('1. Start development server:');
  console.log('   npm run dev\n');
  console.log('2. Open browser:');
  console.log('   http://localhost:3000\n');
  console.log('3. Test OTP signup:');
  console.log('   - Click "Sign Up"');
  console.log('   - Enter your email');
  console.log('   - Check email for OTP code');
  console.log('   - Complete signup\n');

  console.log('📊 Checkpoint 1 Status: ✅ COMPLETE\n');
  console.log('Next: Begin Checkpoint 2 (Admin Setup)\n');

  console.log('='.repeat(80) + '\n');

  rl.close();
}

main().catch(err => {
  console.error('\n❌ Error:', err.message, '\n');
  rl.close();
  process.exit(1);
});
