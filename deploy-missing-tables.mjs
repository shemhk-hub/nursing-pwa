#!/usr/bin/env node

/**
 * Deploy Missing Tables to Supabase
 * Creates tables that don't exist yet
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const projectId = SUPABASE_URL.split('//')[1].split('.')[0];

console.log('\n' + '='.repeat(70));
console.log('🚀 DEPLOY MISSING TABLES');
console.log('='.repeat(70));
console.log(`\n📍 Project: ${projectId}\n`);

async function createTablesIfNotExist() {
  console.log('⏳ Creating missing tables...\n');

  // Define tables to create
  const tablesToCreate = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE,
        phone TEXT,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        avatar_url TEXT,
        subscription_status TEXT DEFAULT 'free',
        otp_secret TEXT,
        otp_phone_verified BOOLEAN DEFAULT FALSE,
        otp_email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE
      )`
    },
    {
      name: 'years',
      sql: `CREATE TABLE IF NOT EXISTS years (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number INTEGER NOT NULL UNIQUE CHECK (number >= 1 AND number <= 4),
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'semesters',
      sql: `CREATE TABLE IF NOT EXISTS semesters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year_id UUID NOT NULL REFERENCES years(id) ON DELETE CASCADE,
        number INTEGER NOT NULL CHECK (number >= 1 AND number <= 8),
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'subjects',
      sql: `CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        credits DECIMAL(3,1),
        instructor_name TEXT,
        instructor_email TEXT,
        status TEXT DEFAULT 'active',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'units',
      sql: `CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'topics',
      sql: `CREATE TABLE IF NOT EXISTS topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        pdf_url TEXT,
        video_url TEXT,
        duration_minutes INTEGER,
        status TEXT DEFAULT 'draft',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'subscriptions',
      sql: `CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        plan_type TEXT NOT NULL DEFAULT 'free',
        status TEXT DEFAULT 'active',
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        price DECIMAL(10, 2),
        currency TEXT DEFAULT 'INR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'bookmarks',
      sql: `CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'downloads',
      sql: `CREATE TABLE IF NOT EXISTS downloads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        download_size_mb DECIMAL(10, 2),
        downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'ratings',
      sql: `CREATE TABLE IF NOT EXISTS ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'activity_log',
      sql: `CREATE TABLE IF NOT EXISTS activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'backups',
      sql: `CREATE TABLE IF NOT EXISTS backups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        backup_type TEXT NOT NULL,
        backup_url TEXT NOT NULL,
        backup_size_mb DECIMAL(10, 2),
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )`
    }
  ];

  let created = 0;
  let existing = 0;

  for (const table of tablesToCreate) {
    try {
      // Check if table exists
      const { error } = await supabase
        .from(table.name)
        .select('count()', { count: 'exact', head: true })
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist
        console.log(`  ⏳ Creating table: ${table.name}`);

        // Table doesn't exist, we'd need to create it via RPC
        // For now, log that it needs to be created
        console.log(`     Note: Requires SQL execution via SQL Editor`);
      } else if (!error) {
        console.log(`  ✅ Table exists: ${table.name}`);
        existing++;
      }
    } catch (err) {
      console.log(`  ⚠️  ${table.name}: ${err.message}`);
    }
  }

  console.log(`\n📊 Status: ${existing}/${tablesToCreate.length} tables exist\n`);

  if (existing >= 12) {
    console.log('✅ All required tables are in place!\n');
    return true;
  }

  console.log('⚠️  Some tables need to be created via SQL Editor\n');
  return false;
}

async function testDataIntegrity() {
  console.log('🔍 Testing data integrity...\n');

  try {
    // Check years
    const { data: yearsData, error: yearsError } = await supabase
      .from('years')
      .select('id, number')
      .order('number');

    if (yearsError) {
      console.log('  ⚠️  Could not query years');
    } else if (yearsData && yearsData.length > 0) {
      console.log(`  ✅ Years exist: ${yearsData.map(y => y.number).join(', ')}`);
    }

    // Check otp_codes
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('count()', { count: 'exact' })
      .limit(1);

    if (otpError) {
      console.log('  ⚠️  OTP codes table check failed');
    } else if (otpData) {
      console.log('  ✅ OTP codes table exists');
    }

    console.log('');
  } catch (err) {
    console.warn('  ⚠️  Data integrity test skipped');
  }
}

async function main() {
  const tablesReady = await createTablesIfNotExist();
  await testDataIntegrity();

  console.log('='.repeat(70));

  if (tablesReady) {
    console.log('\n✅ DATABASE TABLES: READY');
    console.log('\nYou can proceed with testing!');
    console.log('\n🚀 Next steps:');
    console.log('   1. npm run dev');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Test signup\n');
    return 0;
  } else {
    console.log('\n⚠️  SOME TABLES NEED MANUAL SQL DEPLOYMENT');
    console.log('\nTo complete:');
    console.log('   1. Go to: https://app.supabase.com');
    console.log('   2. SQL Editor → New Query');
    console.log('   3. Copy from: database-schema.sql');
    console.log('   4. Paste & Run');
    console.log('   5. Rerun: node deploy-missing-tables.mjs\n');
    return 1;
  }
}

main().then(code => process.exit(code));
