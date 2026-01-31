-- Check if the column exists and what the values are
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed';

-- Check the trigger that creates profiles (to ensure it doesn't set it to true?)
-- (Usually triggers insert default values)
