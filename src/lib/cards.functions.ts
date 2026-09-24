import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function optionalUserId(admin: { auth: { getUser: (t: string) => Promise<{ data: { user: { id: string } | null } }> } }) {
  const h = getRequest()?.headers.get("authorization");
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return null;
  const { data } = await admin.auth.getUser(token).catch(() => ({ data: { user: null } }));
  return data.user?.id ?? null;
}

const cardSchema = z.object({
  name: z.string().trim().min(1).max(28),
  title: z.string().max(28),
  attribute: z.enum(["Frontend", "Backend", "UI/UX", "AI"]),
  rarity: z.enum(["comun", "rara", "holo"]),
  role: z.string().max(40),
  description: z.string().max(160),
  github: z.string().max(60).optional(),
  linkedin: z.string().max(100).optional(),
  commits: z.number().int().min(0).max(1_000_000),
  coffee: z.number().int().min(0).max(1_000_000),
});

const publishSchema = z.object({
  id: z.string().regex(/^[a-z0-9]{6,32}$/).optional(),
  token: z.string().max(64).optional(),
  card: cardSchema,
  photo: z.string().max(1_500_000).regex(/^data:image\/(jpeg|png|webp);base64,/).optional(),
});

export const publishCard = createServerFn({ method: "POST" })
  .inputValidator((d) => publishSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let id = data.id;
    let token = data.token;
    const userId = await optionalUserId(supabaseAdmin);

    if (userId) {
      const { data: mine } = await supabaseAdmin.from("cards").select("id, edit_token").eq("owner_id", userId).maybeSingle();
      if (mine) { id = mine.id; token = mine.edit_token; }
    }
    if (id && !(userId && token)) {
      const { data: row } = await supabaseAdmin.from("cards").select("edit_token").eq("id", id).maybeSingle();
      if (!row || row.edit_token !== token) id = undefined; // not owner → create new
    }
    if (id && userId) {
      const { data: row } = await supabaseAdmin.from("cards").select("edit_token, owner_id").eq("id", id).maybeSingle();
      if (!row || row.edit_token !== token || (row.owner_id && row.owner_id !== userId)) id = undefined;
    }
    if (!id) {
      const { data: row, error } = await supabaseAdmin.from("cards").insert({ data: data.card, owner_id: userId }).select("id, edit_token").single();
      if (error || !row) throw new Error("No se pudo guardar la carta");
      id = row.id; token = row.edit_token;
    }

    const update: { data: typeof data.card; updated_at: string; photo_path?: string; owner_id?: string } = { data: data.card, updated_at: new Date().toISOString() };
    if (userId) update.owner_id = userId;
    if (data.photo) {
      const [meta = "", b64 = ""] = data.photo.split(",");
      const type = meta.slice(5, meta.indexOf(";"));
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `${id}/${Date.now()}.${type.split("/")[1]}`;
      const { error } = await supabaseAdmin.storage.from("card-photos").upload(path, bytes, { contentType: type, upsert: true });
      if (error) throw new Error("No se pudo subir la foto");
      update.photo_path = path;
    }
    const { error } = await supabaseAdmin.from("cards").update(update).eq("id", id!);
    if (error) throw new Error("No se pudo guardar la carta");
    return { id: id!, token: token! };
  });

export const getCard = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().regex(/^[a-z0-9]{6,32}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("cards").select("id, data, photo_path").eq("id", data.id).maybeSingle();
    if (!row) return null;
    let photo: string | undefined;
    if (row.photo_path) {
      const { data: s } = await supabaseAdmin.storage.from("card-photos").createSignedUrl(row.photo_path, 60 * 60 * 24 * 7);
      photo = s?.signedUrl;
    }
    return { ...(row.data as Record<string, unknown>), id: row.id, photo } as import("./card").CardData;
  });

export const getMyCloudCard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("cards").select("id, edit_token, data, photo_path").eq("owner_id", context.userId).maybeSingle();
    if (!row) return null;
    let photo: string | undefined;
    if (row.photo_path) {
      const { data: s } = await supabaseAdmin.storage.from("card-photos").createSignedUrl(row.photo_path, 60 * 60 * 24 * 7);
      photo = s?.signedUrl;
    }
    return { pub: { id: row.id, token: row.edit_token }, card: { ...(row.data as Record<string, unknown>), id: row.id, photo } as import("./card").CardData };
  });
