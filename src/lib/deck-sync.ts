import { supabase } from "@/integrations/supabase/client";
import type { CardData } from "./card";

const DECK = "cardelin:deck";
const local = (): CardData[] => { try { return JSON.parse(localStorage.getItem(DECK) || "[]"); } catch { return []; } };

async function uid() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Sube las cartas locales a la nube y devuelve el mazo combinado. */
export async function syncDeck(): Promise<CardData[]> {
  const userId = await uid();
  if (!userId) return local();
  const mine = local();
  if (mine.length) {
    await supabase.from("deck_cards").upsert(
      mine.map((c) => ({ user_id: userId, card_key: c.id, data: c as never })),
      { onConflict: "user_id,card_key", ignoreDuplicates: true },
    );
  }
  const { data, error } = await supabase.from("deck_cards").select("data").order("added_at", { ascending: false });
  if (error) return mine;
  const deck = (data ?? []).map((r) => r.data as unknown as CardData);
  localStorage.setItem(DECK, JSON.stringify(deck));
  return deck;
}

export async function cloudAdd(c: CardData) {
  const userId = await uid();
  if (userId) await supabase.from("deck_cards").upsert({ user_id: userId, card_key: c.id, data: c as never });
}

export async function cloudRemove(id: string) {
  const userId = await uid();
  if (userId) await supabase.from("deck_cards").delete().eq("card_key", id);
}
