import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log('Checking database schema via API...');

    // Try to select the column. Even with RLS, if column implies syntax error, we know.
    const { data, error } = await supabase
        .from('user_profiles')
        .select('id, onboarding_completed')
        .limit(1);

    if (error) {
        console.error('Error fetching:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('DIAGNOSIS: The column "onboarding_completed" DOES NOT EXIST.');
            console.log('SOLUTION: Please run the MIGRATION_ONBOARDING.sql script in Supabase SQL Editor.');
        } else {
            console.log('DIAGNOSIS: API Error (likely RLS or other):', error.message);
        }
    } else {
        console.log('Success! Column exists.');
        console.log('Sample Data:', data);
    }
}

check();
