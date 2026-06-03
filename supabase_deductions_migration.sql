-- SUPABASE DATABASE MIGRATION SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR (https://supabase.com/dashboard/project/_/sql)

-- 1. Alter dc_bills table to add gross_amount, total_deductions, and net_payable_amount
ALTER TABLE public.dc_bills
  ADD COLUMN IF NOT EXISTS gross_amount numeric(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_deductions numeric(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS net_payable_amount numeric(12, 2) DEFAULT 0.00;

-- 2. Create the dc_bill_deductions table
CREATE TABLE IF NOT EXISTS public.dc_bill_deductions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id uuid REFERENCES public.dc_bills(id) ON DELETE CASCADE NOT NULL,
  deduction_type text NOT NULL,
  deduction_mode text NOT NULL CHECK (deduction_mode IN ('percentage', 'fixed')),
  deduction_value numeric(12, 2) NOT NULL DEFAULT 0.00,
  deduction_amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row-Level Security on dc_bill_deductions
ALTER TABLE public.dc_bill_deductions ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated users full access to dc_bill_deductions" ON public.dc_bill_deductions;
CREATE POLICY "Allow authenticated users full access to dc_bill_deductions"
  ON public.dc_bill_deductions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Backfill existing bills data
UPDATE public.dc_bills
SET 
  gross_amount = amount,
  total_deductions = 0.00,
  net_payable_amount = amount
WHERE gross_amount IS NULL OR gross_amount = 0.00;
