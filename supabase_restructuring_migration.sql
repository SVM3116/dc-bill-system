-- 1. Add maintenance_account_number and salary_account_number to public.schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS maintenance_account_number TEXT,
ADD COLUMN IF NOT EXISTS salary_account_number TEXT;

-- 2. Populate maintenance_account_number with existing account_number values for backward compatibility
UPDATE public.schools 
SET maintenance_account_number = account_number 
WHERE maintenance_account_number IS NULL AND account_number IS NOT NULL;

-- 3. Add account_type to public.dc_bills table with check constraint and default value
ALTER TABLE public.dc_bills 
ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'maintenance' CHECK (account_type IN ('maintenance', 'salary'));

-- 4. Ensure existing records are explicitly marked as maintenance if not handled by default
UPDATE public.dc_bills 
SET account_type = 'maintenance' 
WHERE account_type IS NULL;
