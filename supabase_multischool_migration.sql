-- ==============================================================
-- SUPABASE DATABASE MIGRATION SCRIPT - MULTI-SCHOOL V2 PLATFORM
-- RUN THIS IN YOUR NEW SUPABASE PROJECT SQL EDITOR
-- ==============================================================

-- 1. Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  school_name_en text NOT NULL,
  principal_name text NOT NULL,
  email text UNIQUE NOT NULL,
  school_profile_completed boolean DEFAULT false,
  school_name_kn text,
  school_address_kn text,
  account_type_kn text,
  account_number text,
  account_maintained_by_kn text,
  logo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create dc_bills table
CREATE TABLE IF NOT EXISTS public.dc_bills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  dc_bill_number text NOT NULL,
  cheque_number text NOT NULL,
  cheque_date date NOT NULL,
  payee_name text NOT NULL,
  payee_address text NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  amount_in_words text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated')),
  gross_amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  total_deductions numeric(12, 2) NOT NULL DEFAULT 0.00,
  net_payable_amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_school_cheque UNIQUE (school_id, cheque_number)
);

-- 3. Create dc_bill_deductions table
CREATE TABLE IF NOT EXISTS public.dc_bill_deductions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id uuid REFERENCES public.dc_bills(id) ON DELETE CASCADE NOT NULL,
  deduction_type text NOT NULL,
  deduction_mode text NOT NULL CHECK (deduction_mode IN ('percentage', 'fixed')),
  deduction_value numeric(12, 2) NOT NULL DEFAULT 0.00,
  deduction_amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create recent_activity table
CREATE TABLE IF NOT EXISTS public.recent_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  bill_number text NOT NULL,
  payee_name text NOT NULL,
  user_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dc_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dc_bill_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activity ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Schools Policies
CREATE POLICY "Schools can view their own profile"
  ON public.schools FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Schools can update their own profile"
  ON public.schools FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DC Bills Policies
CREATE POLICY "Schools can view their own bills"
  ON public.dc_bills FOR SELECT
  TO authenticated
  USING (school_id = auth.uid());

CREATE POLICY "Schools can insert their own bills"
  ON public.dc_bills FOR INSERT
  TO authenticated
  WITH CHECK (school_id = auth.uid());

CREATE POLICY "Schools can update their own bills"
  ON public.dc_bills FOR UPDATE
  TO authenticated
  USING (school_id = auth.uid())
  WITH CHECK (school_id = auth.uid());

CREATE POLICY "Schools can delete their own bills"
  ON public.dc_bills FOR DELETE
  TO authenticated
  USING (school_id = auth.uid());

-- DC Bill Deductions Policies
CREATE POLICY "Schools can view deductions of their own bills"
  ON public.dc_bill_deductions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dc_bills
      WHERE dc_bills.id = dc_bill_deductions.bill_id
      AND dc_bills.school_id = auth.uid()
    )
  );

CREATE POLICY "Schools can insert deductions of their own bills"
  ON public.dc_bill_deductions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dc_bills
      WHERE dc_bills.id = dc_bill_deductions.bill_id
      AND dc_bills.school_id = auth.uid()
    )
  );

CREATE POLICY "Schools can update deductions of their own bills"
  ON public.dc_bill_deductions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dc_bills
      WHERE dc_bills.id = dc_bill_deductions.bill_id
      AND dc_bills.school_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dc_bills
      WHERE dc_bills.id = dc_bill_deductions.bill_id
      AND dc_bills.school_id = auth.uid()
    )
  );

CREATE POLICY "Schools can delete deductions of their own bills"
  ON public.dc_bill_deductions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dc_bills
      WHERE dc_bills.id = dc_bill_deductions.bill_id
      AND dc_bills.school_id = auth.uid()
    )
  );

-- Recent Activity Policies
CREATE POLICY "Schools can view their own activity"
  ON public.recent_activity FOR SELECT
  TO authenticated
  USING (school_id = auth.uid());

CREATE POLICY "Schools can log their own activity"
  ON public.recent_activity FOR INSERT
  TO authenticated
  WITH CHECK (school_id = auth.uid());

-- 7. Trigger to automatically create a school record on signup
CREATE OR REPLACE FUNCTION public.handle_new_school()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.schools (
    id,
    school_name_en,
    principal_name,
    email,
    school_profile_completed
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'school_name_en', 'New School'),
    coalesce(new.raw_user_meta_data->>'principal_name', 'Principal'),
    new.email,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_school();
