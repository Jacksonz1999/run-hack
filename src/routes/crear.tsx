// ============= Full file contents =============

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import { Download, LoaderCircle, CloudUpload, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { publishCard, getMyCloudCard } from "@/lib/cards.functions";
import { useSession } from "@/hooks/use-session";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { YugiCard } from "@/components/YugiCard";
import { Nav } from "@/components/Nav";
import {
  ATTRIBUTES, RARITIES, encodeCard, loadMyCard, resizePhoto, saveMyCard, type CardData,
} from "@/lib/card";

export const Route = createFileRoute("/crear")({
  head: () => ({
    meta: [
      { title: "Crear mi carta — Cardelin" },
      { name: "description", content: "Rellena tus datos, sube tu foto e invoca tu carta coleccionable de Cardelin." },
      { property: "og:title", content: "Crear mi carta — Cardelin" },
      { property: "og:description", content: "Tu perfil como carta de duelo: rareza, atributo, ATK de commits y QR para compartir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CrearPage,
});

const blank = (): CardData => ({
  id: crypto.randomUUID(), name: "", title: "Fullstack Sorcerer", attribute: "Frontend",
  rarity: "holo", role: "", description: "", github: "", linkedin: "", commits: 800, coffee: 60,
});

function CrearPage() {
  const [card, setCard] = useState<CardData | null>(null);
  const [origin, setOrigin] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [pub, setPub] = useState<{ id: string; token: string } | null>(null);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const session = useSession();
  const cloudPhoto = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!session) return;
    getMyCloudCard().then((r) => {
      if (!r) return;
      const apply = (photo?: string) => { cloudPhoto.current = photo; setCard(photo ? { ...r.card, photo } : r.card); setPub(r.pub); };
      if (r.card.photo?.startsWith("http")) {
        fetch(r.card.photo).then((res) => res.blob()).then((b) => new Promise<string>((ok, ko) => {
          const fr = new FileReader(); fr.onload = () => ok(fr.result as string); fr.onerror = ko; fr.readAsDataURL(b);
        })).then(apply).catch(() => apply(r.card.photo));
      } else apply(r.card.photo);
      localStorage.setItem("cardelin:published", JSON.stringify(r.pub));
    }).catch((e) => console.error(e));
  }, [session?.user.id]);
  useEffect(() => { try { setPub(JSON.parse(localStorage.getItem("cardelin:published") || "null")); } catch { /* ignore */ } }, []);

  useEffect(() => { setCard(loadMyCard() ?? blank()); setOrigin(window.location.origin); }, []);
  useEffect(() => { if (card) { saveMyCard(card); setSaving((s) => (s === "saved" ? "idle" : s)); } }, [card]);
  if (!card) return <div className="min-h-screen"><Nav /><p className="p-10 text-center text-muted-foreground">Cargando tu carta…</p></div>;

  const set = <K extends keyof CardData>(k: K, v: CardData[K]) => setCard({ ...card, [k]: v });
  const shareUrl = pub ? `${origin}/card?id=${pub.id}` : `${origin}/card?d=${encodeCard(card)}`;

  const publish = async () => {
    if (!card.name.trim()) { setSaving("error"); setDownloadError("Pon tu nombre antes de guardar la carta."); return; }
    setSaving("saving"); setDownloadError("");
    try {
      const { photo, id: _id, ...rest } = card;
      const res = await publishCard({ data: {
        id: pub?.id, token: pub?.token,
        card: { ...rest, github: rest.github || undefined, linkedin: rest.linkedin || undefined, commits: Math.round(rest.commits), coffee: Math.round(rest.coffee) },
        photo: photo?.startsWith("data:") && photo !== cloudPhoto.current ? photo : undefined,
      } });
      localStorage.setItem("cardelin:published", JSON.stringify(res));
      if (photo?.startsWith("data:")) cloudPhoto.current = photo;
      setPub(res); setSaving("saved");
    } catch (e) {
      console.error(e); setSaving("error"); setDownloadError("No se pudo guardar la carta en la nube. Inténtalo de nuevo.");
    }
  };

  const download = async () => {
    if (!ref.current || isDownloading || isProcessingPhoto) return;
    const node = ref.current;
    setIsDownloading(true);
    setDownloadError("");
    try {
      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(images.map(async (image) => {
        if (!image.complete || image.naturalWidth === 0) await image.decode();
      }));

      const PR = 3;
      const opts = { pixelRatio: PR, cacheBust: true, skipFonts: true };
      const canvas = await toCanvas(node, opts);
      // Dibujamos la foto directamente: algunos navegadores (Safari/iPhone) la omiten al capturar.
      const img = node.querySelector<HTMLImageElement>(".ygo-art img");
      const art = node.querySelector<HTMLElement>(".ygo-art");
      if (img && art && img.naturalWidth) {
        const nb = node.getBoundingClientRect(), ab = art.getBoundingClientRect();
        const bw = parseFloat(getComputedStyle(art).borderTopWidth) || 0;
        const x = (ab.left - nb.left + bw) * PR, y = (ab.top - nb.top + bw) * PR;
        const w = (ab.width - bw * 2) * PR, h = (ab.height - bw * 2) * PR;
        const ctx = canvas.getContext("2d")!;
        const s = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, x, y, w, h);
        if (card.rarity === "holo") {
          const g = ctx.createLinearGradient(x, y + h, x + w, y);
          [[0.2, "rgba(0,0,0,0)"], [0.3, "#ff00c8"], [0.4, "#00ffea"], [0.5, "#fff200"], [0.6, "#00ff6a"], [0.7, "rgba(0,0,0,0)"]]
            .forEach(([o, c]) => g.addColorStop(o as number, c as string));
          ctx.save(); ctx.globalAlpha = 0.35; ctx.globalCompositeOperation = "color-dodge";
          ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
        }
      }
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
      if (!blob) throw new Error("No se pudo crear la imagen");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cardelin-${(card.name || "carta").replace(/[^\w-]+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setImageUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
    } catch (error) {
      console.error("No se pudo descargar la carta", error);
      setDownloadError("No se pudo preparar la descarga. Inténtalo de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const field = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-colors";
  const label = "text-xs font-bold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -left-1/10 h-[50%] w-[50%] rounded-full bg-primary opacity-15 blur-[120px]" />
      </div>
      <Nav />
      <main className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_auto]">
        <section className="space-y-5">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-foreground">Invoca <span className="gold-text">tu carta</span></h1>
            <p className="mt-1 text-muted-foreground">Rellena tus datos, sube tu foto y compártela en el evento.</p>
          </div>

          <label className="block">
            <span className={label}>Foto</span>
            <input type="file" accept="image/*" className={`${field} mt-1 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground`}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsProcessingPhoto(true);
                setDownloadError("");
                try {
                  const photo = await resizePhoto(file);
                  set("photo", photo);
                } catch (error) {
                  console.error("No se pudo procesar la foto", error);
                  setDownloadError("No se pudo cargar esa foto. Prueba con otra imagen.");
                } finally {
                  setIsProcessingPhoto(false);
                }
              }} />
            {isProcessingPhoto && <span className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Preparando foto…</span>}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={label}>Nombre</span>
              <input className={`${field} mt-1`} maxLength={28} value={card.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label><span className={label}>Título divertido</span>
              <input className={`${field} mt-1`} maxLength={28} value={card.title} placeholder="Git Master" onChange={(e) => set("title", e.target.value)} /></label>
            <label><span className={label}>Rol actual</span>
              <input className={`${field} mt-1`} maxLength={40} value={card.role} placeholder="Dev en Acme" onChange={(e) => set("role", e.target.value)} /></label>
            <label><span className={label}>Atributo</span>
              <select className={`${field} mt-1`} value={card.attribute} onChange={(e) => set("attribute", e.target.value as CardData["attribute"])}>
                {ATTRIBUTES.map((a) => <option key={a}>{a}</option>)}
              </select></label>
          </div>

          <div>
            <span className={label}>Rareza</span>
            <div className="mt-1.5 flex gap-2">
              {RARITIES.map((r) => (
                <button key={r.value} onClick={() => set("rarity", r.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${card.rarity === r.value ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_color-mix(in_oklab,var(--primary)_40%,transparent)]" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block"><span className={label}>Efecto (descripción breve)</span>
            <textarea className={`${field} mt-1`} rows={3} maxLength={160} value={card.description}
              placeholder="Cuando esta carta entra al hackatón, convierte café en MVPs." onChange={(e) => set("description", e.target.value)} /></label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={label}>GitHub (usuario)</span>
              <input className={`${field} mt-1`} value={card.github} onChange={(e) => set("github", e.target.value)} /></label>
            <label><span className={label}>LinkedIn (usuario)</span>
              <input className={`${field} mt-1`} value={card.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></label>
            <label><span className={label}>Commits este año → ATK</span>
              <input type="number" min={0} className={`${field} mt-1`} value={card.commits} onChange={(e) => set("commits", +e.target.value || 0)} /></label>
            <label><span className={label}>Tazas de café / horas sin dormir → DEF</span>
              <input type="number" min={0} className={`${field} mt-1`} value={card.coffee} onChange={(e) => set("coffee", +e.target.value || 0)} /></label>
          </div>
        </section>

        <aside className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary opacity-20 blur-2xl" />
            <YugiCard ref={ref} card={card} />
          </div>
          <Button type="button" onClick={download} disabled={isDownloading || isProcessingPhoto}
            className="btn-primary-glow h-auto w-full rounded-xl px-4 py-3 font-bold transition-all hover:scale-[1.02]">
            {isDownloading || isProcessingPhoto ? <LoaderCircle className="animate-spin" /> : <Download />}
            {isProcessingPhoto ? "Preparando foto…" : isDownloading ? "Preparando imagen…" : "Descargar carta"}
          </Button>
          <Button type="button" variant="outline" onClick={publish} disabled={saving === "saving" || isProcessingPhoto}
            className="h-auto w-full rounded-xl border-accent/60 px-4 py-3 font-bold text-accent hover:bg-accent/10">
            {saving === "saving" ? <LoaderCircle className="animate-spin" /> : saving === "saved" ? <Check /> : <CloudUpload />}
            {saving === "saving" ? "Guardando…" : saving === "saved" ? "Guardada · actualizar" : pub ? "Guardar cambios" : "Guardar y compartir"}
          </Button>
          {session === null && <Link to="/auth" className="-mt-2 text-center text-xs text-muted-foreground hover:text-accent">Estás como invitado · <span className="font-semibold underline">Entra</span> para vincular tu carta a tu cuenta</Link>}
          {pub && <Link to="/card" search={{ id: pub.id }} className="-mt-2 text-sm font-semibold text-accent hover:underline">Ver mi página pública →</Link>}
          {imageUrl && (
            <div className="w-full rounded-2xl border border-border bg-card/60 p-3 text-center">
              <p className="mb-2 text-xs text-muted-foreground">¿No se descargó? Mantén pulsada la imagen (o clic derecho → Guardar imagen), o <a href={imageUrl} target="_blank" rel="noreferrer" className="font-semibold text-accent underline">ábrela en otra pestaña</a>.</p>
              <img src={imageUrl} alt="Tu carta lista para guardar" className="mx-auto w-40 rounded-lg" />
            </div>
          )}
          {downloadError && <p role="alert" className="-mt-2 text-center text-sm text-destructive">{downloadError}</p>}
          <div className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur">
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG value={shareUrl} size={110} />
            </div>
            <p className="text-sm text-muted-foreground">{pub ? "Tu QR personal: abre tu carta completa con foto." : "Guarda tu carta para que el QR incluya tu foto."}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
