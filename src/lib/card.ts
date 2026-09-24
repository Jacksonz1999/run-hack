export type Rarity = "comun" | "rara" | "holo";
export type Attribute = "Frontend" | "Backend" | "UI/UX" | "AI";

export interface CardData {
  id: string;
  name: string;
  title: string;
  attribute: Attribute;
  rarity: Rarity;
  role: string;
  description: string;
  github?: string;
  linkedin?: string;
  commits: number;
  coffee: number;
  photo?: string; // data URL (local only, not shared via QR)
}

export const ATTRIBUTES: Attribute[] = ["Frontend", "Backend", "UI/UX", "AI"];
export const RARITIES: { value: Rarity; label: string }[] = [
  { value: "comun", label: "Común" },
  { value: "rara", label: "Rara" },
  { value: "holo", label: "Holográfica" },
];

export const atk = (c: CardData) => Math.min(5000, Math.round(c.commits * 2.5 / 50) * 50);
export const def = (c: CardData) => Math.min(5000, Math.round(c.coffee * 25 / 50) * 50);
export const level = (c: CardData) =>
  Math.max(1, Math.min(12, Math.round((atk(c) + def(c)) / 700)));

export function encodeCard(c: CardData): string {
  const { photo: _p, ...rest } = c;
  const bytes = new TextEncoder().encode(JSON.stringify(rest));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCard(s: string): CardData | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const c = JSON.parse(new TextDecoder().decode(bytes));
    if (!c?.name) return null;
    return c as CardData;
  } catch {
    return null;
  }
}

const MY = "cardelin:my-card";
const DECK = "cardelin:deck";

export const loadMyCard = (): CardData | null => {
  try { return JSON.parse(localStorage.getItem(MY) || "null"); } catch { return null; }
};
export const saveMyCard = (c: CardData) => localStorage.setItem(MY, JSON.stringify(c));
export const loadDeck = (): CardData[] => {
  try { return JSON.parse(localStorage.getItem(DECK) || "[]"); } catch { return []; }
};
export const addToDeck = (c: CardData) => {
  const deck = loadDeck().filter((x) => x.id !== c.id);
  localStorage.setItem(DECK, JSON.stringify([c, ...deck]));
};
export const removeFromDeck = (id: string) =>
  localStorage.setItem(DECK, JSON.stringify(loadDeck().filter((x) => x.id !== id)));

export async function resizePhoto(file: File, size = 480): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
  const s = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/jpeg", 0.85);
}
