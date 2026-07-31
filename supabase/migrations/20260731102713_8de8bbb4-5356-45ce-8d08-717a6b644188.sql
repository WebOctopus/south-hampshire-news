-- 1. Suppressed flag on businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS suppressed boolean NOT NULL DEFAULT false;

-- 2. Import runs
CREATE TABLE public.business_import_runs (
  import_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_batches integer NOT NULL DEFAULT 0,
  total_rows integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','complete','failed')),
  deactivation_status text,
  deactivated_count integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_import_runs TO authenticated;
GRANT ALL ON public.business_import_runs TO service_role;

ALTER TABLE public.business_import_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import runs"
  ON public.business_import_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Import batches
CREATE TABLE public.business_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_run_id uuid NOT NULL REFERENCES public.business_import_runs(import_run_id) ON DELETE CASCADE,
  batch_index integer NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete','failed')),
  error_message text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (import_run_id, batch_index)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_import_batches TO authenticated;
GRANT ALL ON public.business_import_batches TO service_role;

ALTER TABLE public.business_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import batches"
  ON public.business_import_batches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Import conflicts
CREATE TABLE public.business_import_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  crm_value text,
  current_value text,
  import_run_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','dismissed')),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_business_import_conflicts_pending
  ON public.business_import_conflicts (business_id, field_name)
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_import_conflicts TO authenticated;
GRANT ALL ON public.business_import_conflicts TO service_role;

ALTER TABLE public.business_import_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import conflicts"
  ON public.business_import_conflicts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. updated_at triggers
CREATE TRIGGER update_business_import_runs_updated_at
  BEFORE UPDATE ON public.business_import_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_import_batches_updated_at
  BEFORE UPDATE ON public.business_import_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_import_conflicts_updated_at
  BEFORE UPDATE ON public.business_import_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Index for the deactivation sweep
CREATE INDEX IF NOT EXISTS idx_businesses_crm_company_id
  ON public.businesses (crm_company_id) WHERE crm_company_id IS NOT NULL;