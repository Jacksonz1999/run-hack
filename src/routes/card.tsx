import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Swords, Share2, Link2, Check, Sparkles, MessageCircle } from "lucide-react";
import { YugiCard } from "@/components/YugiCard";
import { Nav } from "@/components/Nav";
import { getCard } from "@/lib/cards.functions";
import { cloudAdd } from "@/lib/deck-sync";
import { addToDeck, atk, decodeCard, def, loadMyCard, type CardData } from "@/lib/card";

export const Route = createFileRoute("/card")({
  validateSearch: z.object({ d: z.string().optional(), id: z.string().optional() }),
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: async ({ deps }) => ({ card: deps.id && /^[a-z0-9]{6,32}$/.test(deps.id) ? await getCard({ data: { id: deps.id } }).catch(() => null) : null }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.card ? `${loaderData.card.name} — ${loaderData.card.title} | Cardelin` : "Carta de duelista — Cardelin" },
      { name: "description", content: "Mira esta carta de networking de Cardelin, añádela a tu Deck o rétala a un duelo." },
      { property: "og:title", content: "¡Te reto a un duelo en Cardelin!" },
      { property: "og:description", content: "Mira mi carta coleccionable de networking y crea la tuya en 30 segundos." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <p className="p-10 text-center text-muted-foreground">No se pudo cargar la carta.</p>,
  component: CardPage,
});

type Duel = { mine: CardData; myAtk: number; theirDef: number; theirAtk: number; myDef: number; result: "win" | "lose" | "draw" };

function CardPage() {
  const { d, id } = Route.useSearch();
  const { card: remote } = Route.useLoaderData();
  const [card, setCard] = useState<CardData | null | undefined>(undefined);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [duel, setDuel] = useState<Duel | "nocard" | null>(null);

  useEffect(() => {
    setCard(id ? remote : d ? decodeCard(d) : null);
    setUrl(window.location.href);
  }, [d, id, remote]);

  if (card === undefined) return <div className="min-h-screen"><Nav /></div>;

  const text = card ? `¡Mira mi carta de duelista "${card.name} — ${card.title}" en Cardelin! ⚔️ Crea la tuya en 30 segundos:` : "";
  const enc = encodeURIComponent;
  const shares = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const nativeShare = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Cardelin", text, url }); } catch { /* cancelado */ } }
    else copy();
  };
  const startDuel = () => {
    if (!card) return;
    const mine = loadMyCard();
    if (!mine) return setDuel("nocard");
    const myAtk = atk(mine), theirDef = def(card), theirAtk = atk(card), myDef = def(mine);
    const me = myAtk - theirDef, them = theirAtk - myDef;
    setDuel({ mine, myAtk, theirDef, theirAtk, myDef, result: me > them ? "win" : me < them ? "lose" : "draw" });
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-12">
        {card === null && <p className="text-muted-foreground">Esta carta no es válida.</p>}
        {card && (
          <>
            <h1 className="text-center font-display text-3xl font-extrabold text-foreground">Carta de <span className="gold-text">{card.name}</span></h1>
            <YugiCard card={card} />
            <div className="flex gap-4 text-sm font-semibold text-accent">
              {card.github && <a className="hover:underline" target="_blank" rel="noreferrer" href={`https://github.com/${card.github}`}>GitHub</a>}
              {card.linkedin && <a className="hover:underline" target="_blank" rel="noreferrer" href={`https://linkedin.com/in/${card.linkedin}`}>LinkedIn</a>}
            </div>

            <button onClick={startDuel}
              className="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90">
              <Swords className="h-5 w-5" /> Retar a un duelo
            </button>

            {duel === "nocard" && (
              <div className="w-full rounded-xl border border-accent/40 bg-card p-4 text-center text-sm">
                <p className="mb-3 text-foreground">Necesitas tu propia carta para batirte en duelo.</p>
                <Link to="/crear" className="font-bold text-accent hover:underline">Crear mi carta →</Link>
              </div>
            )}
            {duel && duel !== "nocard" && (
              <div className="w-full rounded-xl border border-accent/40 bg-card p-4 text-center">
                <p className="font-display text-2xl font-extrabold">
                  {duel.result === "win" ? <span className="gold-text">¡Victoria!</span> : duel.result === "lose" ? <span className="text-destructive">Derrota</span> : <span className="text-foreground">Empate</span>}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tu ATK {duel.myAtk} vs su DEF {duel.theirDef} · Su ATK {duel.theirAtk} vs tu DEF {duel.myDef}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{duel.mine.name} vs {card.name}</p>
              </div>
            )}

            {added ? (
              <Link to="/deck" className="w-full rounded-xl border-2 border-accent/50 px-4 py-3 text-center font-bold text-accent transition-all hover:bg-accent/10">Añadida · Ver mi Deck</Link>
            ) : (
              <button onClick={() => { addToDeck(card); setAdded(true); void cloudAdd(card); }}
                className="w-full rounded-xl border-2 border-accent/50 px-4 py-3 font-bold text-accent transition-all hover:bg-accent/10">Añadir a mi Deck</button>
            )}

            <section className="w-full rounded-2xl border border-border bg-card/60 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><Share2 className="h-4 w-4" /> Compartir esta carta</p>
              <div className="grid grid-cols-2 gap-2">
                {shares.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                    {s.label === "WhatsApp" && <MessageCircle className="h-4 w-4" />}{s.label}
                  </a>
                ))}
                <button onClick={copy} className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}{copied ? "¡Copiado!" : "Copiar enlace"}
                </button>
                <button onClick={nativeShare} className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground">
                  <Share2 className="h-4 w-4" /> Más…
                </button>
              </div>
            </section>

            <Link to="/crear" className="card-glow flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/60 bg-accent px-4 py-4 text-center font-display text-lg font-extrabold text-accent-foreground transition-transform hover:scale-[1.02]">
              <Sparkles className="h-5 w-5" /> Crea tu propia carta en 30 segundos
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
