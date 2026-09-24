ALTER TABLE public.cards RENAME COLUMN photo_url TO photo_path;
ALTER TABLE public.cards ADD COLUMN edit_token text NOT NULL DEFAULT replace(gen_random_uuid()::text,'-','');
ALTER TABLE public.cards ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
REVOKE SELECT ON public.cards FROM anon, authenticated;
GRANT SELECT (id, data, photo_path, created_at, updated_at) ON public.cards TO anon, authenticated;