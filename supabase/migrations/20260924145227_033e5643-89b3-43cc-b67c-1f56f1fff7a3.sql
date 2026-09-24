CREATE TABLE public.cards (
  id text PRIMARY KEY DEFAULT substr(replace(gen_random_uuid()::text,'-',''),1,10),
  data jsonb NOT NULL,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cards TO anon, authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards are public" ON public.cards FOR SELECT TO anon, authenticated USING (true);