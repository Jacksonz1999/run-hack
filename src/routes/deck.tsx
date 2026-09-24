import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { YugiCard } from "@/components/YugiCard";
import { Nav } from "@/components/Nav";
import { syncDeck, cloudRemove } from "@/lib/deck-sync";
import { useSession } from "@/hooks/use-session";
import { loadDeck, removeFromDeck, type CardData } from "@/lib/card";

export const Route = createFileRoute("/deck")({
  head: () => ({
    meta: [
      { title: "Mi Deck — Cardelin" },
      { name: "description", content: "Tu álbum de cartas coleccionadas en hackatones y eventos." },
      { property: "og:title", content: "Mi Deck — Cardelin" },
      { property: "og:description", content: "Todas las cartas de networking que has escaneado." },
    ],
  }),
  component: Deck,
});

function Deck() {
  const [deck, setDeck] = useState<CardData[]>([]);
  const session = useSession();
  useEffect(() => { setDeck(loadDeck()); if (session) syncDeck().then(setDeck).catch(console.error); }, [session?.user.id]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -left-1/10 h-[50%] w-[50%] rounded-full bg-primary opacity-15 blur-[120px]" />
      </div>
      <Nav />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-4xl font-extrabold text-foreground">
          Mi <span className="gold-text">Deck</span> <span className="text-2xl text-muted-foreground">({deck.length})</span>
        </h1>
        {session === null && (
          <p className="mt-3 text-sm text-muted-foreground">Tu Deck solo está en este dispositivo. <Link to="/auth" className="font-semibold text-accent hover:underline">Entra</Link> para sincronizarlo en la nube.</p>
        )}
        {deck.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-10 text-center backdrop-blur">
            <p className="text-muted-foreground">Aún no tienes cartas. Escanea el QR de alguien con la cámara de tu móvil para empezar tu colección.</p>
            <Link to="/crear"
              className="btn-primary-glow mt-6 inline-block rounded-xl bg-primary px-8 py-3.5 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90">
              Crear mi carta
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {deck.map((c) => (
              <div key={c.id} className="group flex flex-col items-center gap-3">
                <div className="origin-top transition-transform duration-300 group-hover:scale-[1.02]"><YugiCard card={c} /></div>
                <button className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => { removeFromDeck(c.id); setDeck(loadDeck()); void cloudRemove(c.id); }}>Quitar del deck</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
