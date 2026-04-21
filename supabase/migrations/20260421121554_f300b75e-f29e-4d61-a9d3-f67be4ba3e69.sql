-- 1. Add slug column (nullable initially for backfill)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Slugify helper function
CREATE OR REPLACE FUNCTION public.slugify_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  IF input_text IS NULL OR length(trim(input_text)) = 0 THEN
    RETURN 'event';
  END IF;
  -- lowercase, replace non-alphanumeric with -, trim leading/trailing -
  result := lower(input_text);
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '^-+|-+$', '', 'g');
  IF length(result) = 0 THEN
    result := 'event';
  END IF;
  -- cap length
  IF length(result) > 80 THEN
    result := substring(result from 1 for 80);
    result := regexp_replace(result, '-+$', '', 'g');
  END IF;
  RETURN result;
END;
$$;

-- 3. Backfill existing rows with unique slugs (title + first 4 chars of id)
UPDATE public.events
SET slug = public.slugify_text(title) || '-' || substring(id::text from 1 for 4)
WHERE slug IS NULL OR slug = '';

-- 4. Unique index
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique_idx ON public.events(slug);

-- 5. Trigger function: auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.events_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  suffix TEXT;
  collision_count INT := 0;
BEGIN
  -- Only auto-generate if slug is empty or (on update) if title changed AND slug wasn't manually changed
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    base_slug := public.slugify_text(NEW.title);
    candidate := base_slug;

    -- Check collision; append id suffix if needed
    WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = candidate AND id IS DISTINCT FROM NEW.id) LOOP
      collision_count := collision_count + 1;
      suffix := substring(replace(NEW.id::text, '-', '') from 1 for (3 + collision_count));
      candidate := base_slug || '-' || suffix;
      EXIT WHEN collision_count > 5;
    END LOOP;

    NEW.slug := candidate;
  ELSE
    -- Sanitise user-provided slug
    NEW.slug := public.slugify_text(NEW.slug);
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Triggers
DROP TRIGGER IF EXISTS events_set_slug_insert ON public.events;
CREATE TRIGGER events_set_slug_insert
BEFORE INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.events_set_slug();

DROP TRIGGER IF EXISTS events_set_slug_update ON public.events;
CREATE TRIGGER events_set_slug_update
BEFORE UPDATE ON public.events
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '' OR NEW.title IS DISTINCT FROM OLD.title AND (NEW.slug = OLD.slug))
EXECUTE FUNCTION public.events_set_slug();