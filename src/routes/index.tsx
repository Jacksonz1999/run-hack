import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Nav } from "@/components/Nav";
import { YugiCard } from "@/components/YugiCard";
import type { CardData } from "@/lib/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardelin — Convierte tu red en cartas de duelo" },
      { name: "description", content: "Cardelin convierte tu perfil en una carta coleccionable estilo duelo: sube tu foto, comparte tu QR y colecciona las cartas de otros en hackatones." },
      { property: "og:title", content: "Cardelin — Convierte tu red en cartas de duelo" },
      { property: "og:description", content: "Tu perfil como carta coleccionable: ATK de commits, DEF de café y QR para compartir en hackatones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const demo: CardData = {
  id: "demo", name: "Tu Nombre", title: "Fullstack Sorcerer", attribute: "Frontend",
  rarity: "holo", role: "Dev en tu hackatón",
  description: "Cuando esta carta entra al hackatón, convierte café en MVPs. +500 productividad si la conectas con un designer.",
  github: "", linkedin: "", commits: 2500, coffee: 60,
};

const steps = [
  { n: "01", title: "Forja tu carta", text: "Sube tu foto, elige tu atributo (Frontend, Backend, UI/UX, AI), tu título épico y tu rareza." },
  { n: "02", title: "Invoca tu poder", text: "Tu ATK sale de tus commits y tu DEF de tus tazas de café. La carta se genera al instante." },
  { n: "03", title: "Comparte y colecciona", text: "Muestra tu QR para que otros añadan tu carta a su Deck. Escanea los suyos y completa el tuyo." },
];

const features = [
  { icon: "🪄", title: "Marco clásico de duelo", text: "Foto, atributo, estrellas, efecto y rareza: Común, Rara o Holográfica con brillo animado." },
  { icon: "⚔️", title: "ATK / DEF reales", text: "Puntos basados en ti: commits este año para el ataque, tazas de café para la defensa." },
  { icon: "🔗", title: "Enlaces que conectan", text: "GitHub y LinkedIn integrados en la carta. Quien la colecciona sabe encontrarte." },
  { icon: "📱", title: "QR para cada carta", text: "Cada carta lleva su código QR. Escanear y añadir al Deck toma dos segundos." },
  { icon: "🃏", title: "Tu Deck digital", text: "Un álbum con todas las cartas que vayas ganando en eventos y hackatones." },
  { icon: "💾", title: "Descarga en imagen", text: "Llévate tu carta como PNG en alta calidad: redes, slides o tu fondo de pantalla." },
];

function Landing() {
  const [origin, setOrigin] = useState("https://cardelin.app");
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -left-1/10 h-[55%] w-[55%] rounded-full bg-primary opacity-20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/10 h-[55%] w-[55%] rounded-full bg-card opacity-60 blur-[120px]" />
        <div className="dot-grid absolute inset-0" />
      </div>

      <Nav />

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col space-y-8">
            <div className="inline-flex w-fit items-center space-x-2 rounded-full border border-primary/30 bg-card px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Networking de hackatones, nivel duelo
              </span>
            </div>

            <h1 className="font-display text-6xl font-extrabold leading-tight text-foreground md:text-7xl">
              Duelo de <br />
              <span className="gold-text">redes.</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Cardelin convierte tus contactos de hackatón en cartas coleccionables de duelo.
              Crea la tuya con tu foto, compártela con un QR y construye tu Deck con las cartas
              de los mejores builders del evento.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/crear"
                className="btn-primary-glow rounded-xl bg-primary px-8 py-4 text-center font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 active:scale-95">
                Crear mi carta
              </Link>
              <Link to="/deck"
                className="rounded-xl border-2 border-accent/50 px-8 py-4 text-center font-bold text-accent transition-all hover:bg-accent/10">
                Explorar el Deck
              </Link>
            </div>

            <div className="flex gap-12 border-t border-border pt-8">
              <div>
                <div className="font-display text-2xl font-bold text-foreground">ATK</div>
                <div className="text-sm text-muted-foreground">por commits este año</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-foreground">DEF</div>
                <div className="text-sm text-muted-foreground">por tazas de café</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-foreground">∞</div>
                <div className="text-sm text-muted-foreground">cartas en tu Deck</div>
              </div>
            </div>
          </div>

          {/* Card showcase */}
          <div className="group relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-[60px] transition-opacity duration-700 group-hover:opacity-40" />
            <div className="float-card relative">
              <YugiCard card={demo} />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]">
                <div className="holo-sweep absolute inset-0 opacity-30" />
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 hidden -rotate-6 rounded-xl border border-primary/50 bg-background p-4 shadow-2xl md:block">
              <div className="rounded bg-white p-1">
                <QRCodeSVG value={`${origin}/crear`} size={80} />
              </div>
              <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-tight text-accent">
                Escanea y juega
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-4xl font-bold text-foreground">
            ¿Cómo se <span className="gold-text">juega</span>?
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            De contacto anónimo a carta legendaria en tres jugadas.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card/60 p-7 backdrop-blur transition-colors hover:border-primary/40">
                <div className="font-display text-4xl font-extrabold text-primary">{s.n}</div>
                <h3 className="mt-3 font-display text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features as collectible cards */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-4xl font-bold text-foreground">
            Cada detalle, <span className="gold-text">en su carta</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}
                className="group rounded-2xl border-2 border-accent/20 bg-gradient-to-b from-card to-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-xs font-bold text-accent opacity-0 transition-opacity group-hover:opacity-100">★ ★ ★</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-8">
          <div className="card-glow rounded-3xl border border-primary/30 bg-gradient-to-b from-card to-background p-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Tu carta te está <span className="gold-text">esperando</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Tarda menos que presentarte diciendo nombre y puesto. Y funciona mucho mejor.
            </p>
            <Link to="/crear"
              className="btn-primary-glow mt-8 inline-block rounded-xl bg-primary px-10 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90">
              Invocar mi carta
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border bg-background/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display tracking-widest text-foreground">CARDELIN</span>
          <div className="flex gap-6">
            <Link to="/crear" className="transition-colors hover:text-accent">Crear carta</Link>
            <Link to="/deck" className="transition-colors hover:text-accent">Mi Deck</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
