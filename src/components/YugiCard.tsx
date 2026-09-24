import { forwardRef } from "react";
import { atk, def, level, type CardData } from "@/lib/card";

const ATTR: Record<string, { cls: string; glyph: string; jp: string }> = {
  Frontend: { cls: "attr-front", glyph: "光", jp: "FRONT" },
  Backend: { cls: "attr-back", glyph: "闇", jp: "BACK" },
  "UI/UX": { cls: "attr-ux", glyph: "風", jp: "UX" },
  AI: { cls: "attr-ai", glyph: "炎", jp: "AI" },
};

export const YugiCard = forwardRef<HTMLDivElement, { card: CardData }>(({ card }, ref) => {
  const a = ATTR[card.attribute] ?? ATTR["Frontend"]!;
  return (
    <div ref={ref} className="ygo-card">
      <div className="ygo-inner">
        <div className="ygo-name-bar">
          <span className={`ygo-name rarity-${card.rarity}`}>{card.name || "Tu Nombre"}</span>
          <span className={`ygo-attr ${a.cls}`} title={card.attribute}>{a.glyph}</span>
        </div>
        <div className="ygo-stars">
          {Array.from({ length: level(card) }).map((_, i) => <span key={i}>★</span>)}
        </div>
        <div className="ygo-art">
          {card.photo ? (
            <img src={card.photo} alt={card.name} />
          ) : (
            <div className="ygo-art-empty">{(card.name || "?").slice(0, 1).toUpperCase()}</div>
          )}
          {card.rarity === "holo" && <div className="ygo-holo" />}
        </div>
        <div className="ygo-text">
          <div className="ygo-type">[ {card.attribute} / {card.title || "Hacker"} / Efecto ]</div>
          <p className="ygo-effect">
            <b>{card.role}</b>{card.role && card.description ? ". " : ""}{card.description}
          </p>
          <div className="ygo-links">
            {card.github && <span>GH: {card.github}</span>}
            {card.linkedin && <span>IN: {card.linkedin}</span>}
          </div>
          <div className="ygo-stats">
            <span>ATK/{atk(card)}</span><span>DEF/{def(card)}</span>
          </div>
          <div className="ygo-legend">ATK = commits · DEF = tazas de café</div>
        </div>
        <div className="ygo-foot">CRDL-{card.id.slice(0, 6).toUpperCase()} · {a.jp}</div>
      </div>
    </div>
  );
});
YugiCard.displayName = "YugiCard";
