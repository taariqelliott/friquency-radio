# Friquency Radio — Full UI/UX Redesign Spec

**Date:** 2026-06-24  
**Approach:** Shell-first → Room page → Landing → Auth → Rooms list

---

## Decisions

| Decision | Choice |
|---|---|
| Component library | shadcn + Tailwind only — Mantine fully removed |
| Color system | Existing globals.css tweakcn preset (lime primary, dark bg) |
| Display font | VT323 (Google Fonts, via next/font) |
| Body font | Alexandria (existing) |
| Mono font | JetBrains Mono (existing) |
| Color scheme | Toggle preserved (light/dark), driven by next-themes + `.dark` class |
| Login flow | Unchanged — dashboard state on `/` kept, just restyled |

---

## Section 1 — Global Shell (`layout.tsx`)

**Mantine removal:**
- Remove `MantineProvider`, `ColorSchemeScript`, `@mantine/core/styles.css`
- Remove all `@mantine/*` imports across every file
- Replace `useMantineColorScheme` in `login/page.tsx` with `useTheme` from `next-themes`

**next-themes:**
- Add `ThemeProvider` from `next-themes`, `attribute="class"`, `defaultTheme="dark"`
- Wraps `children` inside `RootLayout` — drives the `.dark` class already in globals.css

**VT323 font:**
- Load via `next/font/google`, expose as `--font-display` CSS variable
- Add `--font-display` to the `@theme inline` block in globals.css
- Tailwind utility class: `font-display`

**Font setup on `<html>`:**
- `className={cn(sans.variable, mono.variable, display.variable)}`
- Three font variables available globally: `--font-sans`, `--font-mono`, `--font-display`

**Header component:**
- Rewritten to use `useTheme` + shadcn `Button`/`Tooltip`
- Same controls: color scheme toggle, home icon, stations icon
- No Mantine dependency

---

## Section 2 — Room Page (`/rooms/[id]`)

**Layout shell:**
```
<div class="flex h-dvh overflow-hidden">
  <AppSidebar />                 // 260px fixed, non-scrolling
  <main class="flex-1 flex flex-col overflow-hidden">
    <PlayerCard />               // fixed height ~200px
    <ChatContainer />            // flex-1, scrollable
  </main>
</div>
```

**AppSidebar (new component):**
- Logo: "FRIQUENCY RADIO" in `font-display` ~28px, links to `/`
- Nav: Home + Stations ghost buttons with Tabler icons
- Room list: `ScrollArea`, realtime Supabase subscription, active room highlighted with `bg-accent`
- Bottom: username pill (`text-primary @username`), logout/end-session action
- Mobile: collapses to shadcn `Sheet` drawer, triggered by hamburger in player header
- Colors: `bg-sidebar`, `border-r border-sidebar-border`

**PlayerCard (replaces TwitchClientPlayer):**
- shadcn `Card` with thick border, `bg-card`
- Station name: `font-display` ~32px — loudest display font usage
- Track info: `font-mono text-muted-foreground` (filename + file size)
- Native `<audio>` styled with Tailwind
- Owner controls (upload, replace, remove): opacity-transition in/out, hidden for non-owners
- Mount animation: single `animate-fade-in`, no idle animation

**ChatContainer (restyled):**
- `flex-1 overflow-hidden flex flex-col`
- `ScrollArea` pinned to bottom, auto-scroll on new messages
- New messages: `animate-slide-up` 150ms via tw-animate-css (already imported)
- Own messages: `border-l-2 border-primary/25 bg-primary/5`
- Message input: docked bottom, shadcn `Input` + `Button`, image upload icon button
- Section kicker: "Live Chat" in `font-mono text-xs text-muted-foreground`

---

## Section 3 — Landing Page (`/`)

**Logged-out state:**
- Full-height `bg-background`, no gradient
- Hero: "FRIQUENCY RADIO" in `font-display` ~64px, centered, scanline fade-in on load
- Tagline: "Your station. Your sound. Live." in Alexandria
- CTA row: Login (`Button default`), Sign Up (`Button outline`), Quick Jam (`Button ghost`) with "No sign up required" muted subtitle
- Feature cards: 3-col grid, shadcn `Card`, stagger float-up on load, hover lift + `border-primary/25` glow
- Copy updated: "Listen Together", "Live Chat", "Quick Jam" — no Twitch references

**Logged-in state (dashboard):**
- Existing flow preserved — same `DemoClientComponent`, same logout/end-session buttons
- Restyled: `bg-background`, shadcn `Card` wrapping, VT323 for heading, all hardcoded colors replaced with CSS variables

---

## Section 4 — Auth Pages (`/login`, `/signup`)

- Single `animate-fade-in` on mount, no other motion
- Form wrapped in shadcn `Card`, `max-w-sm` centered, `bg-card`
- "FRIQUENCY RADIO" logo in `font-display` above the card, links to `/`
- Inputs: shadcn `Input` component
- Buttons: shadcn `Button` — login action as `default`, quick jam as `ghost`
- `useMantineColorScheme` removed, replaced with `useTheme` — or converted to a server component where possible
- Signup page follows identical pattern

---

## Section 5 — Rooms List (`/rooms/all`)

- Remove Mantine `Table` — replace with a shadcn card list
- Each room: shadcn `Card` row — station name in `font-display` (smaller, ~18px), creator in `font-mono text-primary`, Enter button as `Button size="sm"`
- Own rooms: crown icon + lime "You" indicator, delete button as `Button variant="destructive" size="sm"`
- Realtime: new rooms slide in from top (`animate-slide-down`), deleted rooms fade out
- Stagger entrance on initial load (~30ms offset per row)
- `CreateRoom` dialog: shadcn `Dialog`, shadcn `Input` + `Button`
- Header: "Stations" in `font-display`, kicker above in `font-mono text-muted-foreground`
- Mantine `Table` import removed entirely

---

## Component Inventory

| Component | Status | Notes |
|---|---|---|
| `AppSidebar` | New | Room page sidebar |
| `PlayerCard` | Rewrite | Was `TwitchClientPlayer` |
| `ChatContainer` | Restyle | Structure preserved |
| `ChatMessages` | Restyle | Animation + own-message treatment |
| `MessageInput` | Restyle | shadcn Input + Button |
| `Header` | Rewrite | Remove Mantine, use next-themes |
| `CreateRoom` | Restyle | shadcn Dialog |
| `AllRoomsList` | Rewrite | Remove Mantine Table |

---

## Animation Rules

| Surface | Motion |
|---|---|
| Landing hero | Scanline fade-in on load |
| Feature cards | Stagger float-up; hover lift + border glow |
| Auth forms | Single fade-in on mount |
| Room list rows | Stagger in on load, 30ms offset |
| New room (realtime) | Slide in from top |
| Deleted room | Fade out |
| Player card | Single fade-in on mount |
| Chat messages | Slide up 150ms |
| Owner controls | Opacity transition only |

No looping animations. No motion while user is passively listening.

---

## File Change Summary

| File | Change |
|---|---|
| `app/layout.tsx` | Remove Mantine, add next-themes, load VT323, wire font variables |
| `app/globals.css` | Add `--font-display`, `font-display` utility |
| `app/components/Header.tsx` | Remove Mantine, use next-themes + shadcn |
| `app/page.tsx` | Restyle both states, update copy |
| `app/login/page.tsx` | Remove Mantine, convert to shadcn form |
| `app/signup/page.tsx` | Remove Mantine, convert to shadcn form |
| `app/rooms/all/page.tsx` | Remove Mantine Table, card list |
| `app/rooms/[id]/page.tsx` | New two-column shell |
| `app/components/TwitchComponent.tsx` | Rewrite → `PlayerCard.tsx` |
| `app/components/ChatContainer.tsx` | Restyle |
| `app/components/ChatMessages.tsx` | Restyle + animations |
| `app/components/MessageInput.tsx` | shadcn Input + Button |
| `app/components/CreateRoom.tsx` | shadcn Dialog restyle |
| `app/components/Header.tsx` | next-themes rewrite |
| `app/components/AppSidebar.tsx` | New |
