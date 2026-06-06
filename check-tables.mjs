import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('\n🔍 CHECKING ALL TABLES IN DATABASE\n');

const allTables = [
  'users', 'years', 'semesters', 'subjects', 'units', 'topics',
  'subscriptions', 'bookmarks', 'downloads', 'ratings',
  'user_progress', 'activity_log', 'backups',
  'notifications', 'otp_codes'
];

let found = 0;
let missing = 0;

for (const table of allTables) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (!error) {
      console.log(`✅ ${table.padEnd(20)} - EXISTS`);
      found++;
    } else {
      console.log(`⏳ ${table.padEnd(20)} - missing`);
      missing++;
    }
  } catch (err) {
    console.log(`❌ ${table.padEnd(20)} - error`);
    missing++;
  }
}

console.log(`\n📊 Summary: ${found}/${allTables.length} tables found\n`);
