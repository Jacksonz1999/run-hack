# 🃏 Cardelin

**Tu perfil de desarrollador como carta coleccionable estilo Yu-Gi-Oh.**

Cardelin es una web app para hacer *networking* en hackatones y eventos: convierte tu perfil de dev en una carta coleccionable con tu foto, stats, enlaces y código QR. Crea tu carta en 30 segundos, compártela con un enlace y reta a un duelo a otros devs.

🔗 **App publicada:** https://cardelin-connect.lovable.app

## ✨ Qué puedes hacer

- **Crear tu carta** — Sube tu foto y personalízala al estilo clásico de Yu-Gi-Oh:
  - **Rareza:** Común, Rara o Holográfica (con efecto holo animado).
  - **Atributo:** Frontend, Backend, UI/UX o AI.
  - **Título divertido:** Fullstack Sorcerer, Git Master, CSS Wizard…
  - **Efecto de carta:** tu descripción, rol actual y enlaces a GitHub y LinkedIn.
  - **ATK / DEF:** puntos basados en tus commits y tazas de café (o horas sin dormir).
- **Descargar tu carta** como imagen PNG lista para compartir.
- **Código QR personal** que apunta a la página pública de tu carta.
- **Deck digital** — un álbum con las cartas que vas escaneando, sincronizado en la nube con tu cuenta.
- **Página pública compartible** para cada carta, con vista previa, botón "Crea tu propia carta en 30 segundos", compartir directo a WhatsApp / X / LinkedIn / Telegram y **"Retar a un duelo"** (ATK vs ATK, victoria, derrota o empate).
- **Iniciar sesión con Google** para vincular tu carta y sincronizar tu Deck desde cualquier dispositivo — o seguir como invitado.

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | TanStack Start (React 19 + Vite 7) |
| Estilos | Tailwind CSS v4, tema oscuro "Duelo Nocturno" (violeta + dorado) |
| Tipografías | Syne, Plus Jakarta Sans, Cinzel (carta) |
| Backend | Lovable Cloud (base de datos + almacenamiento de fotos + auth) |
| Export de carta | html-to-image (PNG con la foto pintada directamente en canvas, compatible Safari/iOS) |
| QR | qrcode.react |

## 🚀 Ejecutar en local

```sh
git clone https://github.com/Jacksonz1999/run-hack.git
cd run-hack
npm i
npm run dev
```

Abre http://localhost:8080.

## 🧠 Cómo funciona por dentro

- Cada carta se guarda en la base de datos con un ID único; la foto se sube a un bucket privado y se sirve mediante URL firmada.
- La página pública (`/card?id=...`) carga la carta completa con su foto; el QR de cada carta apunta ahí.
- Sin sesión, todo funciona en modo invitado (la carta y el Deck viven en tu navegador); al iniciar sesión se sincronizan con la nube.

## 📄 Licencia

MIT
