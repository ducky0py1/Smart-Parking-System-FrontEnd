# Handoff: SmartPark — Web3 Connect-Wallet Login

## Overview
A login / authentication screen for **SmartPark**, a decentralized (Web3) parking
network. The user signs in by connecting a crypto wallet (MetaMask) and signing a
gratuitous (free) message — there is **no email/password**. The page is built around
a full-bleed **animated video background** with a single centered "connect" panel and
a guiding note. All user-facing copy is in **French**.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS + React (via
in-browser Babel)** — a working prototype that demonstrates the intended look and
behavior. They are **not** meant to be shipped as-is. Your task is to **recreate this
design inside the target codebase** using its existing environment, patterns, and
libraries (React, Vue, Svelte, Next.js, etc.). If no front-end environment exists yet,
pick the most appropriate framework for the project and implement the design there.

The prototype simulates the wallet flow with `setTimeout`s. In production you will wire
it to a real wallet provider (e.g. `window.ethereum` / EIP-1193, wagmi, viem,
Web3Modal, or RainbowKit).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, states and transitions
are all specified below. Recreate the UI to match, using the codebase's component
primitives where they exist.

---

## Screens / Views

This is a single screen with **four sequential states** driven by one `status`
variable: `idle → connecting → signing → connected`.

### Layout (all states)
- **Stage**: full viewport (`100%` width/height), `overflow: hidden`, dark background `#07060b`.
- **Three stacked layers** (z-order low → high):
  1. **Video layer** (`z-index: 0`): a `<video id="bg-video">` that fills the viewport
     (`object-fit: cover`). Until a real `<source>` is added, an animated CSS placeholder
     scene shows (drifting orange/purple radial blobs, a perspective grid, scanlines,
     floating particles), plus a readability overlay (radial + linear dark gradients).
     A small dev badge (top-left, toggleable) reads `VIDEO · déposez votre .mp4 dans #bg-video`.
  2. **Center layer** (`z-index: 5`): `position:absolute; inset:0; display:flex;
     align-items:center; justify-content:center; padding:24px` — holds the connect panel.
  3. **Footer** (`z-index: 5`): fixed near bottom, centered, mono uppercase microcopy
     `SmartPark · Accès Web3 sécurisé · v0.1`.
- **Connect panel**: `width: 430px` (drops to `100%` under 520px), centered.

### Panel anatomy (top → bottom)
- **Brand row**: a 48×48 dashed-border logo placeholder (text "LOGO", `title="Téléversez votre logo plus tard"`) + wordmark `SmartPark` (24px/700) + kicker `Réseau de stationnement décentralisé` (mono, 11px, uppercase, muted).
- **Divider** (1px, `--line`).
- **State body** (see States below).

### State: `idle`
- Title: **"Connectez votre portefeuille pour continuer"** (17px / 600)
- Subtitle: "Connectez-vous à SmartPark avec votre portefeuille Web3." (13.5px, muted)
- Primary button: **"Connecter MetaMask"** with a generic geometric wallet glyph (see Assets).
- Guiding **note** (centered, bordered, max-width 340px): *"Nouveau ici ? Connecter
  votre portefeuille crée votre compte SmartPark — sans mot de passe, sans e-mail. Vous
  signerez un message gratuit pour prouver votre identité ; ce n'est pas une transaction
  et n'engendre aucuns frais."*
- Alt link: "Vous n'avez pas de portefeuille ? **Obtenir MetaMask**" → `https://metamask.io/download/`.

### State: `connecting`
- Title: "Ouverture de MetaMask…" / Subtitle: "Approuvez la demande de connexion dans la fenêtre."
- Button shows a spinner + "Connexion…", disabled.
- A 2-step indicator appears: **1 Portefeuille** (active) — **2 Connexion**.

### State: `signing`
- Title: "Confirmez dans votre portefeuille" / Subtitle: "Signez le message pour confirmer que c'est bien vous — sans frais, sans transaction."
- Button: spinner + "En attente de la signature…", disabled.
- Step indicator: step 1 done (✓), step 2 active.

### State: `connected`
- Success ring (54px circle, accent border + glow, checkmark inside).
- Title (centered): **"Portefeuille connecté"**
- Account pill (clickable to copy): gradient avatar + truncated address `0x7A3f…8a01` + "Copier" (→ "Copié ✓" for 1.4s).
- Meta chips: `● Polygon`, `0.0 SPK`, `Vérifié`.
- Primary button: **"Entrer dans SmartPark →"**
- Ghost button: **"Déconnexion"** → resets to `idle`.

---

## Interactions & Behavior
- **Connect click** (`idle` only): `idle → connecting` immediately; `→ signing` after
  **1600ms**; `→ connected` after **3400ms** total. (Replace these timers with real
  wallet provider events: `eth_requestAccounts` then `personal_sign`.)
- **Copy address**: sets "Copié ✓" for **1400ms** then reverts.
- **Disconnect**: clears timers, returns to `idle`.
- **Entrance animation** (`.panel`): translateY(14px)+scale(.985) → none, 700ms
  `cubic-bezier(.2,.7,.2,1)`. Resting state is fully visible (animation only nudges
  transform), so a non-focused tab still shows readable content.
- **Success ring**: `pop` scale(.6)→1, 450ms, only under `prefers-reduced-motion: no-preference`.
- **Buttons**: `:active` translateY(1px); primary `:hover` brightens + deeper glow shadow.
- **Background**: continuous drifting blobs (26s/32s), grid flow (18s), particle floats,
  blinking badge dot — all decorative, paused under reduced-motion.
- **Responsive**: panel goes full-width under 520px; badge & wordmark shrink.

## State Management
- `status: "idle" | "connecting" | "signing" | "connected"` — the master flow state.
- `copied: boolean` — transient copy-confirmation.
- `timers: ref<number[]>` — all `setTimeout` ids, cleared on unmount/disconnect.
- `FAKE_ADDR` — hardcoded demo address; replace with the connected account.
- Production data needs: connected account address, chain/network name, token balance
  (shown as `SPK`), and a verification/auth flag.

## Design Tokens
Colors (CSS custom properties on `:root`):
- `--bg`        `#07060b`  (page background)
- `--ink`       `#f4f1fb`  (primary text)
- `--muted`     `#9a93ad`  (secondary text)
- `--faint`     `#6a6480`  (tertiary / footer)
- `--line`      `rgba(255,255,255,0.10)`  (hairline borders)
- `--accent`    `#ff6a1d`  (hot orange — primary accent)
- `--accent-2`  `#b14dff`  (neon purple — secondary accent)
- `--glow`      `0.6`      (0–1 multiplier on glow intensity)

Accent presets (primary, secondary):
- orange:  `#ff6a1d`, `#ff9a4d`
- purple:  `#b14dff`, `#d08bff`
- duotone (default): `#ff6a1d`, `#b14dff`

Primary button fill: `linear-gradient(135deg, var(--accent), var(--accent-2))`,
text color `#1a0d04`.

Spacing: panel inner padding `30px 30px 26px` (mobile `24px 20px 22px`); section
gaps ~18–22px; chip/gap rhythm 8–14px.

Radii: panel `6px` (grid), `18px` (holo), `0` (terminal); buttons `6px` / `12px` / `0`
by variant; chips `20px`; logo box `8px`.

Shadows: panel `0 30px 80px rgba(0,0,0,.55)` + inset top highlight; primary button
`0 10px 30px color-mix(in oklab, var(--accent) 45%, transparent)`.

Typography:
- Display: **Space Grotesk** (`--font-disp`) — weights 400/500/600/700.
- Mono: **JetBrains Mono** (`--font-mono`) — labels, kicker, chips, footer, terminal variant.
- **Body base font was changed by the user to `Comfortaa`** (set inline on `<body>`),
  with Libre Baskerville & Abril Fatface also loaded. Headings/buttons still pin
  Space Grotesk via `--font-disp`; confirm with the user which family should win in
  production (the page currently mixes Comfortaa for inherited text and Space Grotesk
  for explicitly-styled elements).
- Sizes: wordmark 24px/700; lead-title 17px/600; lead-sub 13.5px; note 12.5px;
  mono labels 10–11px, letter-spacing ~0.06em, uppercase where noted.

## Variants (exposed as in-prototype "Tweaks", pick ONE for production unless theming)
- **grid** (default): frosted glass, square-ish 6px corners, subtle internal grid texture, top accent hairline.
- **holo**: 18px rounded, animated conic-gradient accent border, stronger glow.
- **terminal**: sharp 0-radius, solid accent border, mono everywhere, command-prompt
  label, blinking cursor, scanline feel.
Plus tweakable: accent preset (orange/purple/duotone), grid-texture on/off, glow 0–1,
note text, video-badge on/off.

## Assets
- **Background video**: NOT included — user supplies an `.mp4`; set it as a `<source>`
  inside `<video id="bg-video">`. A CSS placeholder scene stands in meanwhile.
- **Logo**: NOT included — dashed "LOGO" placeholder; user will upload later.
- **Wallet glyph**: a **generic geometric SVG** (rounded card + dot), intentionally NOT
  MetaMask's fox logo. If you have rights to MetaMask brand assets, swap it in; otherwise
  keep a generic mark.
- **Fonts**: Google Fonts (Space Grotesk, JetBrains Mono, Comfortaa, Libre Baskerville, Abril Fatface).
- No icon library is used; the checkmark, arrow, chevron and spinner are CSS/inline SVG.

## Files
- `SmartPark Login.html` — entry point: `:root` tokens, all CSS (incl. 3 variants &
  responsive), font links, script tags. Mounts `#root`.
- `login-app.jsx` — the React app: `VideoLayer`, `WalletMark`, `ConnectPanel` (the flow
  state machine), `Step`, `App`, and `TWEAK_DEFAULTS`/`ACCENTS`. **Start here** for logic & copy.
- `tweaks-panel.jsx` — the prototype's in-page Tweaks panel + host protocol. **Prototype-only
  tooling — do NOT port to production.** It only drives the variant/accent/glow/text demos.

### Notes for production
- Replace the simulated timers in `ConnectPanel.connect()` with real wallet events.
- The `center` and `panel-tex` class names matter: an earlier bug came from class-name
  collisions (`center`, `panel-grid`) — keep component-scoped class names in your port.
- Keep critical content visible at the animation's resting state (don't gate content
  reveal behind an `opacity:0` keyframe) so background tabs / SSR show content.
