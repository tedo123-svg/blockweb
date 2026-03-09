import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const users = [
    { username: 'woreda1', password: 'password123' },
    { username: 'subcity', password: 'admin123' }
  ];

  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('username', u.username);

    if (error) {
      console.error('Failed to update', u.username, error);
    } else {
      console.log('Updated password for', u.username);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
