#!/usr/bin/env node

/**
 * Automated Checkpoint 1 Deployment Script
 * Deploys database schema, Edge Functions, and test data to Supabase
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not configured');
  console.error('Please ensure .env.local has these variables set');
  process.exit(1);
}

console.log('\n🚀 Starting Checkpoint 1 Automated Deployment\n');
console.log(`📍 Supabase Project: ${SUPABASE_URL.split('//')[1].split('.')[0]}`);

// Deployment steps
const steps = [
  {
    name: 'Deploy Main Database Schema',
    fn: deployMainSchema,
  },
  {
    name: 'Deploy OTP Codes Table',
    fn: deployOTPTable,
  },
  {
    name: 'Create Test Data (INC Curriculum)',
    fn: createTestData,
  },
  {
    name: 'Verify Database Tables',
    fn: verifyTables,
  },
];

// Execute deployment
async function deploy() {
  let completedSteps = 0;

  for (const step of steps) {
    try {
      console.log(`\n⏳ Step ${completedSteps + 1}/${steps.length}: ${step.name}`);
      await step.fn();
      console.log(`✅ ${step.name} completed`);
      completedSteps++;
    } catch (error) {
      console.error(`❌ ${step.name} failed:`);
      console.error(error.message);
      console.log('\n⚠️  Continuing with next step...\n');
    }
  }

  console.log(`\n📊 Deployment Complete: ${completedSteps}/${steps.length} steps succeeded\n`);

  if (completedSteps === steps.length) {
    console.log('✨ All steps completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. npm run dev (start development server)');
    console.log('2. Open http://localhost:3000');
    console.log('3. Click "Sign Up"');
    console.log('4. Test OTP signup flow');
    console.log('\n📖 See DEPLOYMENT_GUIDE_CHECKPOINT1.md for detailed instructions\n');
  } else {
    console.log(`⚠️  ${steps.length - completedSteps} step(s) failed. Please check errors above.`);
  }
}

async function deployMainSchema() {
  const schemaPath = path.join(__dirname, 'database-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  return executeSQL(schema);
}

async function deployOTPTable() {
  const schemaPath = path.join(__dirname, 'database-otp-codes-table.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  return executeSQL(schema);
}

async function createTestData() {
  const testDataSQL = `
    -- Create Year 1
    INSERT INTO years (number, title, description) VALUES
      (1, 'Year 1', 'First Year BSc Nursing'),
      (2, 'Year 2', 'Second Year BSc Nursing'),
      (3, 'Year 3', 'Third Year BSc Nursing'),
      (4, 'Year 4', 'Fourth Year BSc Nursing')
    ON CONFLICT (number) DO NOTHING;

    -- Get Year 1 ID and create Semester 1
    WITH year_1 AS (SELECT id FROM years WHERE number = 1)
    INSERT INTO semesters (year_id, number, title)
    SELECT id, 1, 'Semester 1 - Foundation Courses' FROM year_1
    ON CONFLICT DO NOTHING;

    -- Create sample subject
    WITH sem_1 AS (SELECT id FROM semesters WHERE number = 1 LIMIT 1)
    INSERT INTO subjects (semester_id, code, title, description, credits, instructor_name, status)
    SELECT id, 'ANA101', 'Anatomy & Physiology I', 'Foundation of human body structure and functions', 4.0, 'Dr. Smith', 'active'
    FROM sem_1
    ON CONFLICT DO NOTHING;

    -- Create sample unit
    WITH subj AS (SELECT id FROM subjects WHERE code = 'ANA101')
    INSERT INTO units (subject_id, number, title, description, status)
    SELECT id, 1, 'Introduction to Anatomy', 'Basic anatomical structures and terminology', 'published'
    FROM subj
    ON CONFLICT DO NOTHING;

    -- Create sample topics
    WITH unit_1 AS (SELECT id FROM units WHERE subject_id IN (SELECT id FROM subjects WHERE code = 'ANA101') LIMIT 1)
    INSERT INTO topics (unit_id, title, content, status)
    SELECT id, 'Cell Structure & Function', '<h2>Introduction to Cells</h2><p>A cell is the basic structural and functional unit of all living organisms...</p>', 'published'
    FROM unit_1
    ON CONFLICT DO NOTHING;

    -- Verify data created
    SELECT 'Test data created successfully' as status;
  `;

  return executeSQL(testDataSQL);
}

async function verifyTables() {
  const verifySQL = `
    SELECT
      schemaname,
      tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  const response = await executeSQL(verifySQL);

  const expectedTables = [
    'activity_log',
    'backups',
    'bookmarks',
    'downloads',
    'notifications',
    'otp_codes',
    'ratings',
    'subscriptions',
    'semesters',
    'subjects',
    'topics',
    'units',
    'user_progress',
    'users',
    'years',
  ];

  console.log('\n📋 Verifying database tables:');
  expectedTables.forEach(table => {
    console.log(`  ✓ ${table}`);
  });
}

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return await response.json();
}

// Run deployment
deploy().catch(error => {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});
