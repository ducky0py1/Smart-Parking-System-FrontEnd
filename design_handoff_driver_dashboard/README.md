# Handoff: ParkChain — Driver Dashboard

## Overview
A complete driver-facing dashboard for **ParkChain**, a blockchain smart-parking app. The driver
connects a wallet, completes their profile, browses a **live interactive 3D parking lot**, reserves
a **free** spot by choosing a duration and a day/night tarif, pays via MetaMask, then tracks an
**active session timer**, a **wallet/debt** summary, and a **reservation history** — all in **French**,
dark-first with a light/dark toggle.

This continues an existing design system (the ParkChain home & login pages): **Space Grotesk** (display)
+ **Sora** (body), a neon palette, and glassmorphism on a dark base.

---

## About the Design Files
The files in this bundle are **design references created in HTML/CSS + React-via-Babel** — runnable
prototypes that show the intended look and behavior. **They are not production code to paste in.**

Your task is to **recreate these designs inside the ParkChain codebase** using its established stack and
patterns (the integration guide describes **React Context + ethers.js + a Laravel API**). Keep the visual
result pixel-faithful, but implement it with the project's real components, routing, state, and services.

Everything that touches the backend/blockchain has been isolated behind a single mock module
(`mock-backend.js`, exposed as `window.SP`) with **stable function signatures** and `TODO(Claude Code)`
markers. You replace the bodies; the UI never needs to change. See **Backend & Blockchain Wiring** below.

---

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and interactions are all settled.
Recreate the UI pixel-perfectly with the codebase's libraries. The two CSS files
(`base.css`, `dashboard.css`) are production-quality and can be ported largely as-is (or translated
into your styling system — CSS Modules, Tailwind, styled-components — keeping the token values).

---

## Tech Stack of the Prototype (and what to map it to)
| Prototype | Target codebase |
|---|---|
| React 18 via in-browser Babel, components on `window` | Real React app, ES modules / JSX build |
| `window.SP` mock (`mock-backend.js`) | `AuthContext`, `ParkingContext`, `blockchainService`, axios `api` |
| `parking-map-3d.js` (Three.js r128 + OrbitControls, plain JS) | Drop in as-is; mount from a React `useEffect` (see below) |
| `base.css` + `dashboard.css` | Port tokens/classes into your styling system |
| Babel `<script>` tags in the HTML | Your bundler (Vite/CRA/Next) |

---

## Screens / Views

The shell is a **left sidebar + top bar + content area**. Four primary views switch in the content area:
**Carte 3D**, **Mes réservations**, **Portefeuille**, **Paramètres**. Two modals overlay everything:
**Profile completion** (non-dismissible) and **Payment**.

### Shell — Sidebar (`shell.jsx` → `Sidebar`)
- Fixed left column, **256px** expanded (token `--sidebar-w`); collapses to a **78px** rail
  (`--sidebar-rail`) or a floating variant (these are Tweaks-panel options, optional in production).
- Glassmorphism: `background: color-mix(in oklab, var(--bg) 86%, transparent)`, `backdrop-filter: blur(18px)`,
  right border `1px solid var(--border)`.
- **Brand** at top: 36px rounded-square mark (gradient `linear-gradient(140deg, var(--neon-cyan), var(--neon-green))`)
  containing a "P" glyph, then "ParkChain" (display, 19px, 700) with "Conducteur" eyebrow.
- **Nav** grouped under labels "Conduire" / "Compte": Carte 3D, Mes réservations, Portefeuille, Paramètres.
  Active item: `background: var(--surface-2)`, `border: 1px solid var(--border-2)`, plus a 3px cyan
  accent bar (glowing) on the left. Carte item shows a green badge with the live free-spot count;
  Portefeuille shows a pink "dette" badge when debt > 0.
- **Footer** card: avatar (initials from profile), full name, truncated wallet address (monospace).

### Shell — Topbar (`shell.jsx` → `Topbar`)
- Height **70px** (`--topbar-h`), sticky, glass blur, bottom border.
- Left: page title (display, 21px, 700) + subtitle, per view (see `SP_VIEW_META`).
- Right cluster (pills + icon buttons, all 999px / circular):
  - Network pill: green pulsing dot + network name ("Ganache · 1337").
  - **Debt pill** (only when debt > 0): "Dette 0,005 ETH" in pink.
  - Wallet pill: orange dot + short address.
  - Bell icon button with a pink notification dot.
  - **Theme toggle** (sun/moon) — rotates 22° on hover; flips `data-theme` on `<html>`.

### View 1 — Carte 3D (`map-view.jsx` → `MapView`)
- The **3D parking lot fills the content area** (`height: calc(100vh - var(--topbar-h))`), with a
  themed radial-gradient backdrop behind the canvas.
- Floating glass overlay panels (pointer-events pass through the gaps):
  - **Top-left Legend**: Libre / Réservée / Occupée with live counts and colored dots.
  - **Availability card**: animated equalizer bars + big free-spot count.
  - **Top-right control cluster**: zoom in / zoom out / recenter (smooth, eased).
  - **Bottom**: either the hint ("cliquez une place libre pour réserver") or, when a session is
    active, the **Active Reservation card** (see below).
- **Hover tooltip** follows the cursor over a free spot: label, level, "dès 0,0009 ETH/h",
  and "Cliquez pour réserver →".
- **Interaction**: orbit-drag to rotate, wheel to zoom (damped), **click a free (amber) spot** → opens
  the Payment modal. Reserved/occupied spots are not clickable.

#### Active Reservation card (`map-view.jsx` → `ActiveReservationCard`)
- Appears after a successful reservation. Shows: "Session active" tag (pulsing green blip), spot label,
  a large **count-down timer** (`H:MM:SS` if ≥ 1h, else `MM:SS`), a progress bar, accrued cost, total
  duration, and **Prolonger** (+30 min) / **Terminer** buttons.
- Timer is driven by `durationMin` chosen at payment and a `startTime` (Date.now()).

### View 2 — Mes réservations (`views.jsx` → `HistoryView`)
- Header + 3 metric cards (Total stationné / Dépense cumulée / Durée moyenne).
- **Table** with a segmented filter (Toutes / Actives / Terminées) + a search box (filters by spot label).
- Columns: Place (chip), Date, Durée, Montant (ETH), Statut (pill), **Transaction** (short tx hash →
  links to the block explorer in a new tab). Active row uses a green pill; completed rows use a muted pill.
- The current active session is prepended as a synthetic "active" row.

### View 3 — Portefeuille (`views.jsx` → `WalletView`)
- **Wallet hero** (glass, orange glow): "Solde du portefeuille", big balance in ETH, fiat estimate,
  network, a copy-address chip, and a MetaMask badge.
- Two metric cards: **Dette en cours** (pink) and **Dépense totale** (cyan).
- **Debt banner** (only when debt > 0): explanation + amount + "Régler" button → runs the same
  3-step transaction flow as payment, clears the debt, debits balance.
- **Activité récente** list: last few reservations with amount and tx link.

### View 4 — Paramètres (`views.jsx` → `SettingsView`)
- Left sub-nav: Profil / Apparence / Notifications / Réseau & wallet.
- **Profil**: editable prénom/nom/email + read-only wallet address; Save.
- **Apparence**: theme toggle, reduced-motion note.
- **Notifications**: three toggle switches (transactions / rappels / actualités).
- **Réseau & wallet**: network pill, connected wallet (MetaMask badge), **Déconnecter** button.

### Modal A — Profile completion (`modals.jsx` → `ProfileModal`)
- **Non-dismissible.** Shown on entry whenever `user.email` (or first name) is missing — no close button,
  no backdrop-click dismiss. Cannot be escaped until valid.
- Fields: Prénom, Nom (each ≥ 2 chars), Adresse e-mail (regex-validated). Inline errors on blur/submit.
- Submit calls `SP.api.updateProfile(form)` then unlocks the dashboard with a welcome toast.

### Modal B — Payment / Reservation (`modals.jsx` → `PaymentModal`)
Three phases in one modal: **review → tx → done**.
- **Review**:
  - Spot preview (label, level, "Libre").
  - **Durée**: two steppers — **hours** (0–12) and **minutes** (0/15/30/45) — plus quick chips
    (30 min / 1 h / 2 h / 4 h). Minimum enforced duration is **15 min**.
  - **Tarif**: a 2-option segmented control — **Jour** (0,0009 ETH/h, 06h–20h) and **Nuit**
    (0,0006 ETH/h, 20h–06h). The option matching the current local hour shows a "MAINTENANT" badge.
  - **Récapitulatif** (live): `tarif × durée = sous-total`, `+ dette` (if any), `= total` in ETH,
    with a fiat estimate. **Total = sous-total + dette.**
  - CTA: "Payer {total} ETH via MetaMask".
- **Tx**: a 3-step stepper — (1) Signature MetaMask, (2) Confirmation blockchain, (3) Réservation
  vérifiée — advancing via the `onStep` callback from `payForSpot`.
- **Done**: green "Réservation vérifiée" state, then closes and starts the active session.

---

## Pricing Model (the core business logic — implement exactly)
Defined in `mock-backend.js`; mirror it server-/contract-side:
- `TARIF = { day: { rate, from, to }, night: { rate, from, to } }` — **rate is ETH per hour**.
  - `day`: rate `0.0009`, window `06h–20h` (`from:6, to:20`)
  - `night`: rate `0.0006`, window `20h–06h` (`from:20, to:6`)
- `currentPeriod()` → `'day' | 'night'` from the local hour: `h >= 6 && h < 20 ? 'day' : 'night'`.
- `computePrice(durationMin, period)` → `rate × (durationMin / 60)`, rounded to 4 decimals (ETH).
- **Total charged** = `computePrice(durationMin, period) + outstandingDebt`. On success the debt is cleared.
- The chosen `durationMin` + `period` should be persisted with the reservation
  (`POST /reservations` payload includes `duration_min` and `period`) and drives the session timer.

> ⚠️ The rates and day-window are **placeholders**. Source them from the smart contract / backend.

---

## Interactions & Behavior
- **Theme**: toggling sets `document.documentElement.dataset.theme = 'light' | 'dark'`, persisted to
  `localStorage['pc-theme']`, and calls `map.setTheme(theme)` so the 3D scene re-lights (day vs dusk).
- **Live spots**: every **3s** the map polls new spot states (`SP.tick()` in the mock → your real poll
  or websocket). The 3D map diffs and recolors only changed spots, adding/removing parked cars.
- **Reserve flow**: click free spot → PaymentModal → on confirm: mark spot `reserved`, clear debt,
  debit balance, create active session (with chosen duration), prepend a history row, toast.
- **End session**: frees the spot, marks history row completed.
- **Prolonger**: +30 min to the active session.
- **Copy address**: writes to clipboard + success toast.
- **Toasts**: pending (spinner) / success (check) / error (alert); auto-dismiss via `ttl`.
- **Reduced motion**: the 3D idle pulses and entrance animations respect `prefers-reduced-motion`.

### Motion
- Transitions use `--ease: cubic-bezier(0.22, 1, 0.36, 1)` (see base.css), ~0.2–0.45s.
- 3D camera: OrbitControls with `enableDamping`, `dampingFactor 0.08`; zoom buttons lerp the camera
  distance toward a target each frame (smooth, not snapping); recenter/focus tween position+target.

---

## State Management
Map these prototype `useState`s (in `app.jsx`) to your Context/store:
- `theme` → app-level theme provider (persisted).
- `profile { firstName, lastName, email }`, `showProfile` → **AuthContext** (user + profile-complete gate).
- `spots[]` → **ParkingContext** (live), `freeCount` derived.
- `debt`, `balance` → wallet state (from chain / backend).
- `activeResv { id, label, durationMin, startTime, price, txHash }` → active session.
- `history[]` → fetched from `GET /reservations/history`.
- `payingSpot` → which spot the PaymentModal is for (null = closed).
- `toasts[]` → your toast/notification system.

---

## Design Tokens
All defined in `base.css` `:root` (dark) with a `[data-theme="light"]` override block. Key values:
- **Fonts**: `--font-display: "Space Grotesk"`, `--font-body: "Sora"`.
- **Neon palette**: `--neon-green` (libre/accent), `--neon-cyan` (purple-blue primary accent),
  `--neon-pink` (occupée/danger), `--metamask` (hot-orange, wallet). Defined in oklch.
- **Status mapping (UI + legend)**: free `#ff9a3c` (orange), reserved `#a85cff` (purple),
  occupied `#ff4f9a` (pink).
- **Surfaces**: `--bg`, `--bg-2`, `--surface`, `--surface-2`, `--border`, `--border-2`,
  `--text`, `--muted`, `--faint`.
- **Layout** (dashboard.css): `--sidebar-w: 256px`, `--sidebar-rail: 78px`, `--topbar-h: 70px`,
  `--panel-radius: 16px`.
- **Easing**: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- **3D pad colors** (deeper, tuned to survive ACES tone-mapping): free `0xe86a0c`, reserved `0x7d2fe0`,
  occupied `0xe01f6e` — these are intentionally more saturated than the flat-UI hexes above.

---

## The 3D Map Module (`parking-map-3d.js`)
Self-contained vanilla JS — **reusable as-is** in React. Requires **Three.js r128** and the matching
**OrbitControls** loaded globally before it.

```js
// inside a React component
const ref = useRef(null);
const mapRef = useRef(null);
useEffect(() => {
  const inst = window.ParkingMap3D.create(ref.current, {
    spots,                 // [{ id, label, status:'free'|'reserved'|'occupied', level }]
    theme,                 // 'dark' | 'light'
    onSpotClick: (spot) => openPayment(spot),
    onSpotHover: (spot, x, y) => showTooltip(spot, x, y),
    onHoverEnd: () => hideTooltip(),
  });
  mapRef.current = inst;
  return () => inst.destroy();
}, []);
useEffect(() => { mapRef.current?.updateSpots(spots); }, [spots]);
useEffect(() => { mapRef.current?.setTheme(theme); }, [theme]);
```
Instance API: `updateSpots(list)`, `setTheme(t)`, `zoomIn()`, `zoomOut()`, `recenter()`,
`focusSpot(id)`, `resize()`, `destroy()`. The lot is **16 places (A1–B8)**; layout derives positions
from the label (row letter + column number), so changing the spot list scales it.

---

## Backend & Blockchain Wiring (replace stubs, keep signatures)
All in `mock-backend.js` (`window.SP`). Search `TODO(Claude Code)`:

| Mock call | Replace with |
|---|---|
| `SP.user` (firstName/email null gate) | `AuthContext` user; show ProfileModal when profile incomplete |
| `SP.api.updateProfile(form)` | `AuthContext.updateProfile(formData)` |
| `SP.getSpots()` / `SP.tick()` | `ParkingContext` spots + real poll/websocket (3s) |
| `SP.blockchain.payForSpot(spotId, totalEth, onStep)` | ethers.js: `contract.payForSpot(spotId, { value: parseEther(String(totalEth)) })`, `await tx.wait()`, return `{ txHash }`. Call `onStep(1/2/3)` to drive the stepper. |
| `SP.api.saveReservation(payload)` | `POST /reservations` — payload includes `spot_id, transaction_hash, amount, duration_min, period` |
| `SP.api.fetchHistory()` | `GET /reservations/history` |
| `disconnect()` (in `app.jsx`) | `AuthContext.disconnect()` + redirect to the login/connect screen |
| `SP.TARIF` | Source rates + windows from the contract/backend, not constants |
| `GANACHE_EXPLORER` | Your network's block-explorer base URL |

Reservation payload shape to standardize on:
`{ spot_id, transaction_hash, amount /* total ETH */, duration_min, period /* 'day'|'night' */ }`

---

## Files in this bundle
- `Tableau de bord conducteur.html` — entry point; wires fonts, Three.js, React/Babel, and all modules.
- `base.css` — design tokens + shared components (ported from the home/login pages). **Do not diverge.**
- `dashboard.css` — dashboard shell, 3D stage, panels, modals (incl. duration/tarif controls), tables, settings.
- `parking-map-3d.js` — the Three.js lot (reuse as-is).
- `mock-backend.js` — **the integration contract.** Replace bodies, keep signatures.
- `icons.jsx` — inline SVG icon set.
- `shell.jsx` — Sidebar, Topbar, Toasts.
- `modals.jsx` — ProfileModal, PaymentModal.
- `map-view.jsx` — MapView + ActiveReservationCard.
- `views.jsx` — HistoryView, WalletView, SettingsView.
- `app.jsx` — top-level state, flows, theme, polling, toasts (the "controller" to translate into your app).
- `tweaks-panel.jsx` — optional layout playground (not needed in production).

## How to run the reference locally
Open `Tableau de bord conducteur.html` via any static server (it needs network access for the
Three.js / React / fonts CDNs). Complete the profile modal to reach the dashboard, then click a
free (amber) spot to exercise the full reserve → pay → session flow.
