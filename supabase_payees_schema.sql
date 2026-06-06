-- 🏛️ SQL Migration: Create Reusable Payee / Vendor Directory Table
-- Execute this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the payees table
CREATE TABLE IF NOT EXISTS public.payees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row-Level Security (RLS)
ALTER TABLE public.payees ENABLE ROW LEVEL SECURITY;

-- 3. Create a Policy to isolate payees by school
CREATE POLICY "Schools can only manage their own payees" 
ON public.payees 
FOR ALL 
TO authenticated
USING (auth.uid() = school_id)
WITH CHECK (auth.uid() = school_id);

-- 4. Create an index on school_id for performance optimization
CREATE INDEX IF NOT EXISTS payees_school_id_idx ON public.payees(school_id);
CREATE INDEX IF NOT EXISTS payees_name_idx ON public.payees(name);
