ALTER TABLE public.cards ADD COLUMN owner_id uuid UNIQUE;

CREATE TABLE public.deck_cards (
  user_id uuid NOT NULL,
  card_key text NOT NULL,
  data jsonb NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deck_cards TO authenticated;
GRANT ALL ON public.deck_cards TO service_role;
ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own deck select" ON public.deck_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own deck insert" ON public.deck_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own deck update" ON public.deck_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own deck delete" ON public.deck_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);