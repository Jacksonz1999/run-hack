import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function Nav() {
  const session = useSession();
  return (
    <header className="relative z-20 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="font-display text-xl font-extrabold tracking-widest text-foreground">
          CARDE<span className="text-accent">LIN</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold uppercase tracking-wider">
          <Link to="/crear" activeProps={{ className: "text-accent" }} className="text-muted-foreground transition-colors hover:text-foreground">Mi carta</Link>
          <Link to="/deck" activeProps={{ className: "text-accent" }} className="text-muted-foreground transition-colors hover:text-foreground">Deck</Link>
          {session ? (
            <button onClick={() => supabase.auth.signOut()} title={session.user.email ?? ""}
              className="text-muted-foreground uppercase transition-colors hover:text-foreground">Salir</button>
          ) : session === null ? (
            <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">Entrar</Link>
          ) : null}
          <Link to="/crear" className="hidden rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-[0_0_15px_color-mix(in_oklab,var(--primary)_40%,transparent)] transition-all hover:bg-primary/90 sm:block">
            Crear carta
          </Link>
        </nav>
      </div>
    </header>
  );
}
