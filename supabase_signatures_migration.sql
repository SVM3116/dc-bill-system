-- ==============================================================
-- SUPABASE DATABASE MIGRATION SCRIPT - CUSTOM PDF SIGNATURES
-- RUN THIS IN YOUR SUPABASE PROJECT SQL EDITOR
-- ==============================================================

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS right_signature_kn text DEFAULT 'ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ',
ADD COLUMN IF NOT EXISTS show_left_signature boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS left_signature_kn text DEFAULT 'ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ';

COMMENT ON COLUMN public.schools.right_signature_kn IS 'Dynamic label for right footer signature in PDF';
COMMENT ON COLUMN public.schools.show_left_signature IS 'Toggle to display secondary left signature in PDF';
COMMENT ON COLUMN public.schools.left_signature_kn IS 'Dynamic label for left footer signature in PDF';
