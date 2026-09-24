import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Nav } from "@/components/Nav";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Cardelin" },
      { name: "description", content: "Inicia sesión en Cardelin para guardar tu carta y sincronizar tu Deck en todos tus dispositivos." },
      { property: "og:title", content: "Entrar — Cardelin" },
      { property: "og:description", content: "Vincula tu carta y sincroniza tu Deck en la nube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (session) navigate({ to: "/crear", replace: true }); }, [session, navigate]);

  const google = async () => {
    setBusy(true); setError("");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo."); setBusy(false); }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-extrabold text-foreground">Entra al <span className="gold-text">duelo</span></h1>
        <p className="text-muted-foreground">Vincula tu carta a tu cuenta y sincroniza tu Deck en cualquier dispositivo.</p>
        <button onClick={google} disabled={busy}
          className="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-70">
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Continuar con Google
        </button>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Link to="/crear" className="text-sm font-semibold text-accent hover:underline">Seguir como invitado →</Link>
      </main>
    </div>
  );
}
