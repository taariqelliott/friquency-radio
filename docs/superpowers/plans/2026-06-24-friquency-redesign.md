# Friquency Radio — Full UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Mantine with shadcn/Tailwind across the entire app, implement Spotify-style room layout with AppSidebar + PlayerCard, and apply the retro broadcast terminal aesthetic via VT323 display font and existing tweakcn CSS variables.

**Architecture:** Shell-first — install deps and wire ThemeProvider/VT323 in layout.tsx first (alongside MantineProvider to avoid breakage), then convert each component to remove Mantine, then assemble the room page layout, then restyle remaining pages. Remove MantineProvider only in the final cleanup task once every Mantine import is gone.

**Tech Stack:** Next.js 14, Supabase, shadcn/ui, Tailwind CSS, next-themes, VT323 (Google Fonts), @tabler/icons-react, tw-animate-css

## Global Constraints

- All colors via CSS variables only — `bg-background`, `text-foreground`, `text-primary`, `text-muted-foreground`, `border-border`, etc. No hardcoded hex values.
- Font tiers: `font-display` (VT323) for station names/logo/page titles; `font-mono` (JetBrains Mono) for usernames/timestamps/metadata; default sans (Alexandria) for body copy and inputs.
- `font-display` pixel font only at `text-2xl` or larger (24px+) — never on body copy or inputs.
- No looping animations. No idle motion while audio is playing.
- Dark mode default, light mode toggle preserved via next-themes + `.dark` class.
- Do not modify any Supabase server actions or auth logic — only UI layer changes.
- `CreateRoom` action (`app/rooms/all/actions.ts`) is unchanged. Remove the Twitch username field from the UI only.

---

## File Map

| File | Change |
|---|---|
| `app/layout.tsx` | Add ThemeProvider + VT323; then in Task 14 remove MantineProvider |
| `app/globals.css` | Add `--font-display` variable + `font-display` Tailwind utility |
| `tailwind.config.ts` | Add `darkMode: 'class'` |
| `postcss.config.mjs` | Task 14 only: replace Mantine plugins with autoprefixer |
| `app/components/Header.tsx` | Full rewrite — next-themes + shadcn Button/Tooltip |
| `app/components/MessageInput.tsx` | Remove Mantine Input/Modal — shadcn Input + state-based alert |
| `app/components/CreateRoom.tsx` | Remove Mantine Modal/TextInput, remove Twitch field — shadcn Dialog/Input |
| `app/components/AppSidebar.tsx` | New — sidebar with logo, nav, room list, user info, mobile Sheet |
| `app/components/PlayerCard.tsx` | New — audio player replacing TwitchComponent |
| `app/components/TwitchComponent.tsx` | Deleted in Task 14 |
| `app/components/MessageList.tsx` | Restyle — own-message treatment, font-mono usernames |
| `app/components/ChatContainer.tsx` | Restyle — flex-1 shell, section kicker |
| `app/rooms/[id]/page.tsx` | Two-column layout shell, wire AppSidebar + PlayerCard + ChatContainer |
| `app/page.tsx` | Redesign both states — VT323 hero, updated copy, shadcn Cards |
| `app/login/page.tsx` | Remove useMantineColorScheme — shadcn Card/Input/Button form |
| `app/signup/page.tsx` | Remove useMantineColorScheme — shadcn Card/Input/Button form |
| `app/rooms/all/page.tsx` | Remove Mantine Table — shadcn-styled card list with stagger animation |
| `components/ui/input.tsx` | New (shadcn) |
| `components/ui/dialog.tsx` | New (shadcn) |
| `components/ui/sheet.tsx` | New (shadcn) |
| `components/ui/scroll-area.tsx` | New (shadcn) |
| `components/ui/badge.tsx` | New (shadcn) |
| `components/ui/tooltip.tsx` | New (shadcn) |
| `components/ui/separator.tsx` | New (shadcn) |
| `components/ui/card.tsx` | New (shadcn) |

---

### Task 1: Install dependencies and shadcn components

**Files:**
- Modify: `package.json` (via npm commands)
- Create: `components/ui/input.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`, `components/ui/scroll-area.tsx`, `components/ui/badge.tsx`, `components/ui/tooltip.tsx`, `components/ui/separator.tsx`, `components/ui/card.tsx`

**Interfaces:**
- Produces: `next-themes` package, all shadcn component files available for import in subsequent tasks

- [ ] **Step 1: Install next-themes**

```bash
cd "friquency-radio"
npm install next-themes
```

Expected output: `added X packages` with next-themes listed.

- [ ] **Step 2: Install shadcn components**

```bash
npx shadcn@latest add input dialog sheet scroll-area badge tooltip separator card
```

Accept all prompts. This creates files under `components/ui/`.

- [ ] **Step 3: Verify component files exist**

```bash
ls components/ui/
```

Expected: `badge.tsx  button.tsx  card.tsx  dialog.tsx  input.tsx  scroll-area.tsx  separator.tsx  sheet.tsx  tooltip.tsx`

- [ ] **Step 4: Commit**

```bash
git add components/ui/ package.json package-lock.json
git commit -m "feat: install next-themes and shadcn ui components"
```

---

### Task 2: Foundation — layout.tsx, globals.css, tailwind.config.ts

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: `ThemeProvider` wrapping children, `font-display` Tailwind class, `--font-display` CSS variable available globally, `darkMode: 'class'` active

- [ ] **Step 1: Update tailwind.config.ts to enable class-based dark mode**

Replace the entire file with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Add --font-display to globals.css**

In `app/globals.css`, inside the `:root` block, add after the `--font-mono` line:

```css
--font-display: "VT323", monospace;
```

Inside the `.dark` block, add after the `--font-mono` line:

```css
--font-display: "VT323", monospace;
```

Inside the `@theme inline` block, add after `--font-mono: var(--font-mono);`:

```css
--font-display: var(--font-display);
```

At the very end of `app/globals.css`, outside all `@layer` blocks, add:

```css
.font-display {
  font-family: var(--font-display);
}
```

- [ ] **Step 3: Rewrite app/layout.tsx**

Replace the entire file with:

```tsx
import { ThemeProvider } from "next-themes";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Alexandria, JetBrains_Mono, VT323 } from "next/font/google";
import { Suspense } from "react";
import Header from "./components/Header";
import "./globals.css";
import { cn } from "@/lib/utils";

const alexandria = Alexandria({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "fRIQuencyRADIO - Live Music, DJ Sets & Audio Streaming",
  description:
    "Join live DJ sets, music streaming, and real-time chat with a global community of music enthusiasts and creators.",
  keywords: [
    "live music", "DJ sets", "audio streaming", "music chat", "friquency",
    "friquency radio", "Taariq", "Taariq Elliott", "music producer",
    "FL Studio", "Ableton", "beats", "R&B", "hip-hop", "soul", "funk",
    "jazz", "gospel", "blues", "neo-soul", "house", "afrobeat", "trap",
    "dancehall", "reggae", "grime", "drill", "bounce", "go-go", "disco",
    "garage", "high-fidelity audio", "live music rooms", "custom music rooms",
    "realtime collaboration", "social listening", "music lovers",
    "music enthusiasts", "producers", "DJs", "audiophiles",
    "global music platform", "live events", "virtual concerts",
    "beat making sessions", "nextjs", "supabase", "postgres", "realtime",
    "collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(alexandria.variable, jetbrainsMono.variable, vt323.variable)}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MantineProvider defaultColorScheme="dark">
            <Suspense fallback={null}>
              <Header />
              {children}
            </Suspense>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify the app runs**

```bash
npm run dev
```

Open `http://localhost:3000`. The app should load. Check browser console — no font errors, no ThemeProvider errors. Mantine still works since it's still present.

- [ ] **Step 5: Verify font-display is available**

Temporarily add `className="font-display text-4xl"` to any heading in `app/page.tsx`, reload, confirm VT323 renders. Remove the temporary change.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css tailwind.config.ts
git commit -m "feat: add ThemeProvider, VT323 font, darkMode class config"
```

---

### Task 3: Rewrite Header.tsx

**Files:**
- Modify: `app/components/Header.tsx`

**Interfaces:**
- Consumes: `useTheme` from `next-themes`, shadcn `Button` from `components/ui/button.tsx`
- Produces: `<Header />` — fixed top-right nav with color toggle, home, stations icons; user pill that opens profile edit modal; mobile drawer. No Mantine imports.

- [ ] **Step 1: Rewrite app/components/Header.tsx**

Replace the entire file with:

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  IconBrightness2,
  IconHome,
  IconMenu2,
  IconMoonStars,
  IconRadio,
  IconX,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProfileEditPage from "../profile/edit/page";

interface User {
  username: string;
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", authUser.id)
          .single();
        if (error) throw error;
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [supabase]);

  useEffect(() => { fetchUser(); }, [fetchUser, searchParams.get("auth")]);
  useEffect(() => { setIsClient(true); }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <div className="fixed right-3 top-3 z-20">
        <div className="flex items-start gap-2">
          {user && (
            <button
              onClick={() => setModalOpen(true)}
              className="app-pill hidden md:inline-flex"
            >
              <span className="text-primary">@</span>
              {user.username}
            </button>
          )}

          <div className="app-panel-soft hidden items-center gap-2 p-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle color scheme"
            >
              {isClient && (theme === "dark" ? (
                <IconBrightness2 size={20} />
              ) : (
                <IconMoonStars size={20} />
              ))}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/")}
              aria-label="Home"
            >
              <IconHome size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/rooms/all")}
              aria-label="Stations"
            >
              <IconRadio size={20} />
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <IconMenu2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-background border-l border-border p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-display text-xl text-primary">FRIQUENCY</span>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                <IconX size={18} />
              </Button>
            </div>
            {user && (
              <button
                onClick={() => { setModalOpen(true); setDrawerOpen(false); }}
                className="app-pill justify-start"
              >
                <span className="text-primary">@</span>{user.username}
              </button>
            )}
            <Button variant="ghost" onClick={toggleTheme} className="justify-start gap-2">
              {isClient && (theme === "dark" ? <IconBrightness2 size={18} /> : <IconMoonStars size={18} />)}
              Toggle theme
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/"; setDrawerOpen(false); }} className="justify-start gap-2">
              <IconHome size={18} /> Home
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/rooms/all"; setDrawerOpen(false); }} className="justify-start gap-2">
              <IconRadio size={18} /> Stations
            </Button>
          </div>
        </div>
      )}

      {/* Profile edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setModalOpen(false)}
            >
              <IconX size={16} />
            </Button>
            <h2 className="font-semibold mb-4">Edit profile</h2>
            <ProfileEditPage />
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm: top-right nav renders, color toggle works, no Mantine import errors in terminal. On mobile width (< 768px) confirm hamburger opens the drawer.

- [ ] **Step 3: Commit**

```bash
git add app/components/Header.tsx
git commit -m "feat: rewrite Header with next-themes and shadcn, remove Mantine"
```

---

### Task 4: Rewrite MessageInput.tsx

**Files:**
- Modify: `app/components/MessageInput.tsx`

**Interfaces:**
- Consumes: shadcn `Input` from `components/ui/input.tsx`
- Produces: `<ChatInput room_id user_id />` — same functionality, no Mantine imports. Empty-message validation uses inline state instead of a Modal.

- [ ] **Step 1: Rewrite app/components/MessageInput.tsx**

Replace the entire file with:

```tsx
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { IconPhotoPlus } from "@tabler/icons-react";
import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

interface ChatInputForm {
  message_text: string;
}

const ChatInput = ({
  room_id,
  user_id,
}: {
  room_id: string;
  user_id: string;
}) => {
  const supabase = createClient();
  const { register, handleSubmit, reset } = useForm<ChatInputForm>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) setImageFile(file);
      }
    }
  };

  const handleClearImage = (e: MouseEvent) => {
    e.preventDefault();
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await onSubmit({ message_text: e.currentTarget.value });
    }
  };

  const onSubmit = async (data: ChatInputForm) => {
    if (data.message_text.trim() === "" && !imageFile) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 2000);
      return;
    }

    setUploading(true);
    let imageUrl = null;

    try {
      if (imageFile) {
        const uploadedImageName = `${new Date().toISOString()}_${imageFile.name
          .trim()
          .replace(/[^\w.-]/g, "_")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-images")
          .upload(`images/${uploadedImageName}`, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("chat-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData?.publicUrl;
      }

      const { error } = await supabase.from("chat").insert({
        message_text: data.message_text,
        image_url: imageUrl,
        room_id,
        user_id,
      });

      if (!error) {
        reset();
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error in submission:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {validationError && (
        <p className="text-xs text-destructive px-1">Message or image required</p>
      )}
      <form
        className="app-card flex items-center gap-2 p-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full app-action-secondary px-0"
          title="Upload Image"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <IconPhotoPlus className="w-5 h-5" />
        </label>

        {imageFile && (
          <div className="relative flex items-center justify-center">
            <img
              src={URL.createObjectURL(imageFile)}
              className="h-11 w-11 object-cover rounded mr-2"
              alt=""
            />
            <button
              onClick={handleClearImage}
              className="absolute top-0 right-0 bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              &times;
            </button>
          </div>
        )}

        <Input
          type="text"
          className="flex-grow"
          placeholder={imageFile ? imageFile.name : "Type your message here"}
          {...register("message_text")}
          onPaste={handlePaste}
          onKeyDown={handleKeyPress}
        />
        <button className="app-action-primary text-sm" type="submit" disabled={uploading}>
          {uploading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Navigate to any room page. Confirm chat input renders, typing and sending works, image upload button visible. Empty send shows inline error text (not a modal).

- [ ] **Step 3: Commit**

```bash
git add app/components/MessageInput.tsx
git commit -m "feat: rewrite MessageInput with shadcn Input, remove Mantine"
```

---

### Task 5: Rewrite CreateRoom.tsx

**Files:**
- Modify: `app/components/CreateRoom.tsx`

**Interfaces:**
- Consumes: shadcn `Dialog`, `Input`, `Button` from `components/ui/`; `createRoom` server action from `app/rooms/all/actions.ts` (unchanged)
- Produces: `<CreateRoom />` — opens a Dialog to create a station by name only (Twitch username field removed). No Mantine imports.

- [ ] **Step 1: Rewrite app/components/CreateRoom.tsx**

Replace the entire file with:

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createRoom } from "../rooms/all/actions";

export default function CreateRoom() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (name.length > 26) {
      setError("Name must be 26 characters or fewer.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    try {
      const result = await createRoom(formData);
      if ("roomId" in result) {
        setOpen(false);
        setName("");
        router.push(`/rooms/${result.roomId}`);
      } else if ("error" in result) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="mt-4">
        Create Station
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="station-name" className="text-sm font-medium">
                Station name
              </label>
              <Input
                id="station-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Late Night Jazz"
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Station</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Navigate to `/` (logged in) or `/rooms/all`. Click "Create Station" — confirm Dialog opens, name field accepts input, submitting navigates to the new room. Twitch username field is gone. Error messages appear inline.

- [ ] **Step 3: Commit**

```bash
git add app/components/CreateRoom.tsx
git commit -m "feat: rewrite CreateRoom with shadcn Dialog, remove Mantine and Twitch field"
```

---

### Task 6: Build AppSidebar

**Files:**
- Create: `app/components/AppSidebar.tsx`

**Interfaces:**
- Consumes: shadcn `ScrollArea`, `Separator`, `Button`, `Sheet`, `SheetContent`, `SheetTrigger` from `components/ui/`; Supabase realtime
- Produces: `<AppSidebar roomId currentUsername isOwner />` — 260px fixed sidebar with logo, nav, scrollable room list (active room highlighted), user info at bottom, mobile Sheet. Must not render the global `<Header />` on room pages.

- [ ] **Step 1: Create app/components/AppSidebar.tsx**

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconHome,
  IconMenu2,
  IconRadio,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "@/app/actions";

interface Room {
  id: string;
  name: string;
}

interface AppSidebarProps {
  roomId: string;
  currentUsername: string | null;
  isOwner: boolean;
}

function SidebarContent({
  roomId,
  currentUsername,
  isOwner,
}: AppSidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("rooms").select("id, name").order("name");
      if (data) setRooms(data);
    };

    fetchRooms();

    const channel = supabase
      .channel("sidebar:rooms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload) => {
          setRooms((prev) =>
            [...prev, payload.new as Room].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rooms" },
        (payload) => {
          setRooms((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link
        href="/"
        className="font-display text-2xl text-foreground hover:text-primary transition-colors"
      >
        FRIQUENCY RADIO
      </Link>

      <div className="flex flex-col gap-1">
        <Button variant="ghost" className="justify-start gap-2" asChild>
          <Link href="/"><IconHome size={16} /> Home</Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-2" asChild>
          <Link href="/rooms/all"><IconRadio size={16} /> Stations</Link>
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono text-muted-foreground px-2 uppercase tracking-wider">Stations</p>
        <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
          <div className="flex flex-col gap-1 pr-2">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className={`rounded-md px-3 py-2 text-sm font-mono transition-colors hover:bg-accent hover:text-accent-foreground truncate ${
                  room.id === roomId
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {room.name}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Separator />
        {currentUsername && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-muted-foreground truncate">
              <span className="text-primary">@</span>{currentUsername}
              {isOwner && (
                <span className="ml-1 text-xs text-primary">(owner)</span>
              )}
            </span>
            <form action={handleLogout}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Logout">
                <IconLogout size={16} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppSidebar(props: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-dvh sticky top-0">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile trigger — rendered inside room page header area */}
      <div className="md:hidden fixed top-3 left-3 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <IconMenu2 size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: no TypeScript errors on `AppSidebar.tsx`. (It won't render yet — the room page layout wires it in Task 10.)

- [ ] **Step 3: Commit**

```bash
git add app/components/AppSidebar.tsx
git commit -m "feat: add AppSidebar component with realtime room list and mobile Sheet"
```

---

### Task 7: Build PlayerCard

**Files:**
- Create: `app/components/PlayerCard.tsx`

**Interfaces:**
- Consumes: shadcn `Card`, `CardContent` from `components/ui/card.tsx`; Supabase client for audio upload/realtime; Tabler icons
- Produces: `<PlayerCard room isOwner />` where `room` has shape `{ id: string; name: string; created_by: string; audio_url: string | null; audio_filename: string | null }`. Handles upload/replace/remove for owners. Subscribes to room row changes for realtime audio URL updates.
- Note: the `rooms` table must have `audio_url` (text, nullable) and `audio_filename` (text, nullable) columns. If these columns don't exist yet, run in Supabase SQL editor before testing:
  ```sql
  alter table rooms add column if not exists audio_url text;
  alter table rooms add column if not exists audio_filename text;
  ```

- [ ] **Step 1: Create app/components/PlayerCard.tsx**

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconUpload,
  IconTrash,
  IconMusic,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface PlayerRoom {
  id: string;
  name: string;
  created_by: string;
  audio_url: string | null;
  audio_filename: string | null;
}

interface PlayerCardProps {
  room: PlayerRoom;
  isOwner: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PlayerCard({ room, isOwner }: PlayerCardProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(room.audio_url);
  const [audioFilename, setAudioFilename] = useState<string | null>(room.audio_filename);
  const [uploading, setUploading] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updated = payload.new as PlayerRoom;
          setAudioUrl(updated.audio_url);
          setAudioFilename(updated.audio_filename);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, room.id]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const sanitized = file.name.trim().replace(/[^\w.\-]/g, "_");
      const path = `${room.id}/${Date.now()}-${sanitized}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("room-audio")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("room-audio")
        .getPublicUrl(uploadData.path);

      await supabase
        .from("rooms")
        .update({
          audio_url: urlData.publicUrl,
          audio_filename: file.name,
        })
        .eq("id", room.id);

      setFileSize(formatBytes(file.size));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    await supabase
      .from("rooms")
      .update({ audio_url: null, audio_filename: null })
      .eq("id", room.id);
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b border-border animate-in fade-in duration-300">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <IconMusic size={12} /> Station Audio
            </p>
            <h2 className="font-display text-3xl mt-1 truncate text-foreground leading-none">
              {room.name}
            </h2>
            {audioFilename && (
              <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
                {audioFilename}
                {fileSize && ` • ${fileSize}`}
              </p>
            )}
            {!audioUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                No audio uploaded yet.
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex shrink-0 flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="app-action-primary flex items-center gap-2 text-sm px-3 py-1.5 disabled:opacity-50"
              >
                <IconUpload size={14} />
                {uploading ? "Uploading..." : audioUrl ? "Replace Audio" : "Upload Audio"}
              </button>
              {audioUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="app-action-danger flex items-center gap-2 text-sm px-3 py-1.5"
                >
                  <IconTrash size={14} /> Remove Audio
                </button>
              )}
              <p className="text-xs text-muted-foreground text-right">
                MP3, M4A, WAV · Max 50MB
              </p>
            </div>
          )}
        </div>

        {audioUrl && (
          <audio
            controls
            preload="metadata"
            className="w-full"
            src={audioUrl}
            key={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: no TypeScript errors on `PlayerCard.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/components/PlayerCard.tsx
git commit -m "feat: add PlayerCard component with audio upload and realtime sync"
```

---

### Task 8: Restyle MessageList.tsx

**Files:**
- Modify: `app/components/MessageList.tsx`

**Interfaces:**
- Consumes: `Message`, `User` interfaces (unchanged)
- Produces: `<MessageList messages user />` — same data shape and logic, restyled: own messages get `border-l-2 border-primary/25 bg-primary/5`, `font-mono` for usernames and timestamps, URL linking preserved.

- [ ] **Step 1: Replace the return statement in app/components/MessageList.tsx**

Replace only the JSX return (lines 63–129), keeping all the logic above it identical:

```tsx
  return (
    <ul className="flex flex-col gap-3 w-full">
      {messages.map((message) => (
        <li key={message.message_id} className="animate-in slide-in-from-bottom-2 duration-150">
          <div
            className={`app-card w-full break-words ${
              message.user_id === user?.id
                ? "border-l-2 border-primary/25 bg-primary/5"
                : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <strong className="font-mono text-sm text-primary">
                <span className="text-muted-foreground">@</span>
                {message.username || "Unknown"}
              </strong>
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm">{renderMessageText(message.message_text)}</div>
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Uploaded"
                className="mt-2 max-w-full rounded"
                onLoad={() => handleImageLoad(message.message_id)}
                onError={() => handleImageLoad(message.message_id)}
                onLoadStart={() =>
                  setLoadingImages((prev) => new Set(prev).add(message.message_id))
                }
              />
            )}
          </div>
        </li>
      ))}
      <div ref={endOfMessagesRef} />
    </ul>
  );
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Navigate to a room page, send a message. Confirm own messages have a left primary-tinted border, other messages do not. Usernames are `font-mono`. Timestamps are `font-mono text-xs`.

- [ ] **Step 3: Commit**

```bash
git add app/components/MessageList.tsx
git commit -m "style: restyle MessageList with own-message treatment and font-mono"
```

---

### Task 9: Restyle ChatContainer.tsx

**Files:**
- Modify: `app/components/ChatContainer.tsx`

**Interfaces:**
- Consumes: `<ChatMessages user room_id />`, `<ChatInput room_id user_id />` (unchanged)
- Produces: `<ChatContainer id />` — `flex-1 overflow-hidden` shell with "Live Chat" kicker, `ScrollArea` pinned to bottom, login prompt for guests.

- [ ] **Step 1: Rewrite app/components/ChatContainer.tsx**

Replace the entire file with:

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./MessageInput";

interface User {
  id: string;
  username: string;
}

const ChatContainer = ({ id }: { id: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient();
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        setUser({
          id: currentUser.user.id,
          username: currentUser.user.user_metadata?.username || "",
        });
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, [id]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 gap-3">
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Live Chat</p>
        <h2 className="text-lg font-semibold">Room Conversation</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-sm text-muted-foreground">Loading chat...</span>
          </div>
        ) : (
          <ChatMessages user={user} room_id={id} />
        )}
      </div>

      <div className="mt-auto">
        {!loading && !user ? (
          <div className="app-card text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">Login</Link>
            {" or "}
            <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
            {" to chat"}
          </div>
        ) : user ? (
          <ChatInput room_id={id} user_id={user.id} />
        ) : null}
      </div>
    </div>
  );
};

export default ChatContainer;
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Open a room page. Confirm "Live Chat" kicker appears, chat messages scroll, input docked at bottom, login prompt shows for unauthenticated users.

- [ ] **Step 3: Commit**

```bash
git add app/components/ChatContainer.tsx
git commit -m "style: restyle ChatContainer with kicker, flex layout, and login prompt"
```

---

### Task 10: Rebuild room page layout (`/rooms/[id]`)

**Files:**
- Modify: `app/rooms/[id]/page.tsx`

**Interfaces:**
- Consumes: `<AppSidebar roomId currentUsername isOwner />`, `<PlayerCard room isOwner />`, `<ChatContainer id />` from previous tasks
- Produces: two-column `flex h-dvh` layout — AppSidebar (260px fixed) + main column (PlayerCard + ChatContainer). Global `<Header />` is hidden on this page via `overflow-hidden` on html/body.
- Note: update the Supabase select to include `audio_url` and `audio_filename` from the rooms table.

- [ ] **Step 1: Rewrite app/rooms/[id]/page.tsx**

Replace the entire file with:

```tsx
import AppSidebar from "@/app/components/AppSidebar";
import ChatContainer from "@/app/components/ChatContainer";
import PlayerCard from "@/app/components/PlayerCard";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, created_by, audio_url, audio_filename")
    .eq("id", id)
    .single();

  if (roomError || !room) notFound();

  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUserId = currentUserResponse?.user?.id ?? null;

  const { data: currentUser } = currentUserId
    ? await supabase
        .from("users")
        .select("username")
        .eq("id", currentUserId)
        .single()
    : { data: null };

  const { data: ownerUser } = await supabase
    .from("users")
    .select("username")
    .eq("id", room.created_by)
    .single();

  const isOwner =
    !!currentUser?.username &&
    !!ownerUser?.username &&
    currentUser.username === ownerUser.username;

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar
        roomId={id}
        currentUsername={currentUser?.username ?? null}
        isOwner={isOwner}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <PlayerCard room={room} isOwner={isOwner} />
        <ChatContainer id={id} />
      </main>
    </div>
  );
};

export default RoomPage;
```

- [ ] **Step 2: Hide the global Header on the room page**

The global `<Header />` in `layout.tsx` renders on all pages. On the room page the sidebar replaces it. Add this to the top of `app/rooms/[id]/page.tsx`, after imports:

```tsx
export const metadata = {
  title: "Station — fRIQuencyRADIO",
};
```

And in `app/layout.tsx`, wrap `<Header />` to only show on non-room pages by checking the pathname. Since `layout.tsx` is a server component, use a conditional via a client wrapper. Create `app/components/ConditionalHeader.tsx`:

```tsx
"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/rooms/") && pathname !== "/rooms/all") return null;
  return <Header />;
}
```

Then in `app/layout.tsx`, replace `<Header />` with `<ConditionalHeader />` and update the import:

```tsx
import ConditionalHeader from "./components/ConditionalHeader";
// ...
<ConditionalHeader />
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Navigate to a room URL (e.g. `/rooms/some-id`). Confirm:
- Sidebar renders on the left (260px), with logo, nav links, room list
- PlayerCard renders at the top of the main column
- Chat fills remaining height
- Global header is NOT visible on the room page
- Global header IS visible on `/`, `/rooms/all`, `/login`
- Mobile: sidebar hamburger appears top-left on small screens

- [ ] **Step 4: Commit**

```bash
git add app/rooms/[id]/page.tsx app/components/ConditionalHeader.tsx app/layout.tsx
git commit -m "feat: implement Spotify-style room layout with AppSidebar and PlayerCard"
```

---

### Task 11: Redesign Landing Page (`/`)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: shadcn `Card`, `CardContent` from `components/ui/card.tsx`; `DemoClientComponent` (unchanged); `handleLogout`, `handleDeleteAccount` server actions (unchanged); `anonymousSignIn` (unchanged)
- Produces: full-height `bg-background` landing page. Logged-out: VT323 hero with scanline fade, updated copy, 3 feature cards. Logged-in: restyled dashboard with VT323 heading.

- [ ] **Step 1: Rewrite app/page.tsx**

Replace the entire file with:

```tsx
import Link from "next/link";
import { fetchUser, handleDeleteAccount, handleLogout } from "./actions";
import { anonymousSignIn } from "./anon/actions";
import DemoClientComponent from "./components/DemoClientComponent";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await fetchUser();

  if (user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <h1 className="font-display text-4xl text-primary">Dashboard</h1>
            <DemoClientComponent />
            <div className="w-full flex justify-center">
              {user.user.is_anonymous ? (
                <form action={handleDeleteAccount}>
                  <button
                    type="submit"
                    className="app-action-danger px-6 py-2 text-sm font-semibold"
                  >
                    End Session
                  </button>
                </form>
              ) : (
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="app-action-secondary px-6 py-2 text-sm font-semibold"
                  >
                    Logout
                  </button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-6 py-16 gap-16">
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-700">
        <h1 className="font-display text-6xl md:text-8xl text-foreground leading-none tracking-tight">
          FRIQUENCY RADIO
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Your station. Your sound. Live.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/login"
            className="app-action-primary px-6 py-2 text-sm font-semibold"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="app-action-secondary px-6 py-2 text-sm font-semibold"
          >
            Sign Up
          </Link>
          <form
            action={async () => {
              "use server";
              try { await anonymousSignIn(); } catch { /* handled */ }
            }}
          >
            <button
              type="submit"
              className="flex flex-col items-center app-action-secondary px-6 py-2 text-sm font-semibold"
            >
              Quick Jam
              <span className="text-xs text-muted-foreground font-normal">No sign up required</span>
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          {
            title: "Listen Together",
            body: "Create a station, upload audio, and share the link. Everyone hears the same track.",
          },
          {
            title: "Live Chat",
            body: "Real-time conversation alongside the music. React, discuss, vibe together.",
          },
          {
            title: "Quick Jam",
            body: "No account needed — jump in as a guest and start listening in seconds.",
          },
        ].map((card, i) => (
          <Card
            key={card.title}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 hover:border-primary/40 transition-all"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-6">
              <h3 className="font-display text-2xl text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Visit `http://localhost:3000` logged out. Confirm: VT323 "FRIQUENCY RADIO" hero renders large, 3 feature cards stagger in, Quick Jam button present, no Twitch references anywhere. Visit logged in — confirm dashboard Card renders, DemoClientComponent visible, logout button works.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign landing page with VT323 hero and shadcn feature cards"
```

---

### Task 12: Redesign Auth Pages (`/login`, `/signup`)

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/signup/page.tsx`

**Interfaces:**
- Consumes: shadcn `Input`, `Card`, `CardContent` from `components/ui/`; `login` / `signup` server actions (unchanged); `anonymousSignIn` (unchanged)
- Produces: centered auth forms using `useTheme` instead of `useMantineColorScheme`. Single `fade-in` on mount.

- [ ] **Step 1: Rewrite app/login/page.tsx**

Replace the entire file with:

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { anonymousSignIn } from "../anon/actions";
import { login } from "./actions";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <span className="font-mono text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh gap-4 animate-in fade-in duration-300">
      <Link
        href="/"
        className="font-display text-2xl text-foreground hover:text-primary transition-colors"
      >
        FRIQUENCY RADIO
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="font-display text-3xl text-primary text-center">LOGIN</h1>

          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" required />
            </div>
            <button
              type="submit"
              formAction={login}
              className="app-action-primary w-full py-2 text-sm font-semibold mt-1"
            >
              Login
            </button>
          </form>

          <div className="flex gap-2">
            <Link
              href="/signup"
              className="app-action-secondary flex-1 py-2 text-xs font-semibold text-center"
            >
              Sign Up
            </Link>
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await anonymousSignIn();
                  router.push("/");
                  window.location.reload();
                } catch { /* handled */ }
              }}
              className="app-action-secondary flex-1 py-2 text-xs font-semibold"
            >
              Quick Jam
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite app/signup/page.tsx**

Replace the entire file with:

```tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { anonymousSignIn } from "../anon/actions";
import { signup } from "./actions";

export default function SignupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <span className="font-mono text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh gap-4 animate-in fade-in duration-300">
      <Link
        href="/"
        className="font-display text-2xl text-foreground hover:text-primary transition-colors"
      >
        FRIQUENCY RADIO
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="font-display text-3xl text-primary text-center">SIGN UP</h1>

          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" required />
            </div>
            <button
              type="submit"
              formAction={signup}
              className="app-action-primary w-full py-2 text-sm font-semibold mt-1"
            >
              Sign Up
            </button>
          </form>

          <div className="flex gap-2">
            <Link
              href="/login"
              className="app-action-secondary flex-1 py-2 text-xs font-semibold text-center"
            >
              Login
            </Link>
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await anonymousSignIn();
                  router.push("/");
                  window.location.reload();
                } catch { /* handled */ }
              }}
              className="app-action-secondary flex-1 py-2 text-xs font-semibold"
            >
              Quick Jam
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Visit `/login` and `/signup`. Confirm: `useMantineColorScheme` is gone (no Mantine import), forms render correctly, submit actions work, Quick Jam navigates correctly.

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx app/signup/page.tsx
git commit -m "feat: redesign auth pages with shadcn Card/Input, remove useMantineColorScheme"
```

---

### Task 13: Rebuild Rooms List (`/rooms/all`)

**Files:**
- Modify: `app/rooms/all/page.tsx`

**Interfaces:**
- Consumes: `<CreateRoom />` (updated in Task 5); `DeleteRoom` server action (unchanged); Supabase realtime (unchanged)
- Produces: card-list rooms page — station names in `font-display`, realtime insert/delete, stagger entrance. No Mantine Table import.

- [ ] **Step 1: Rewrite app/rooms/all/page.tsx**

Replace the entire file with:

```tsx
"use client";

import CreateRoom from "@/app/components/CreateRoom";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteRoom } from "./DeleteRoom";

interface Room {
  id: string;
  name: string;
  created_by: string;
  username: string;
}

const supabase = createClient();

const fetchCurrentUser = async () => {
  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUserId = currentUserResponse?.user?.id ?? null;
  if (!currentUserId) return null;
  const { data: currentUser, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", currentUserId)
    .single();
  if (error) return null;
  return currentUser?.username || null;
};

const RoomsPage = () => {
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <main className="min-h-dvh p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">Browse</p>
          <h1 className="font-display text-5xl text-foreground">Stations</h1>
        </div>
        {user && <CreateRoom />}
        <ListAllRooms />
      </div>
    </main>
  );
};

const ListAllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const init = async () => {
      const username = await fetchCurrentUser();
      setCurrentUsername(username);

      const { data, error } = await supabase.from("rooms").select(`
        id, name, created_by,
        users:created_by (username)
      `);

      if (error) {
        setError(error);
      } else {
        setRooms(
          data
            .map((room: any) => ({
              id: room.id,
              name: room.name,
              created_by: room.created_by,
              username: room.users.username,
            }))
            .sort((a: Room, b: Room) => a.name.localeCompare(b.name))
        );
      }
      setLoading(false);
    };

    init();

    const channel = supabase
      .channel("public:rooms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload: { new: Room }) => {
          setRooms((prev) =>
            [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rooms" },
        (payload: { old: any }) => {
          setRooms((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (roomId: string) => {
    const isDeleted = await DeleteRoom(roomId);
    if (isDeleted) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    }
  };

  if (loading) {
    return (
      <div className="font-mono text-sm text-muted-foreground">Loading stations...</div>
    );
  }

  if (error) {
    return <div className="text-destructive text-sm">{error.message}</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="font-mono text-sm text-muted-foreground">
        No stations yet. Create the first one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rooms.map((room, i) => (
        <div
          key={room.id}
          className="app-card flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="min-w-0">
            <h2 className="font-display text-2xl truncate text-foreground">{room.name}</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {room.username === currentUsername ? (
                <span className="text-primary">@{room.username} (you)</span>
              ) : (
                <span>@{room.username}</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/rooms/${room.id}`}
              className="app-action-primary text-sm px-4 py-1.5"
            >
              Enter
            </Link>
            {room.username === currentUsername && (
              <button
                onClick={() => handleDelete(room.id)}
                className="app-action-danger text-sm px-3 py-1.5"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomsPage;
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Navigate to `/rooms/all`. Confirm: station names render in VT323 large font, cards stagger in on load, Enter button navigates to room, Delete button visible only for own rooms, CreateRoom button visible when logged in.

- [ ] **Step 3: Commit**

```bash
git add app/rooms/all/page.tsx
git commit -m "feat: rebuild rooms list with shadcn card layout, remove Mantine Table"
```

---

### Task 14: Final Mantine cleanup

**Files:**
- Modify: `app/layout.tsx`
- Modify: `postcss.config.mjs`
- Delete: `app/components/TwitchComponent.tsx`
- Modify: `package.json` (via npm uninstall)

**Interfaces:**
- Produces: zero Mantine imports anywhere in the codebase. PostCSS config clean. Build passes.

- [ ] **Step 1: Verify no remaining Mantine imports**

```bash
grep -r "@mantine" app/ components/ --include="*.tsx" --include="*.ts" -l
```

Expected output: **empty** (no files). If any files appear, fix them before proceeding.

- [ ] **Step 2: Remove MantineProvider from app/layout.tsx**

In `app/layout.tsx`, remove:
- `import { ColorSchemeScript, MantineProvider } from "@mantine/core";`
- `import "@mantine/core/styles.css";`
- The `<ColorSchemeScript />` element from `<head>`
- The `<MantineProvider defaultColorScheme="dark">` wrapper and its closing tag

The final `<body>` should look like:

```tsx
<body className="bg-background text-foreground font-sans antialiased">
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <Suspense fallback={null}>
      <ConditionalHeader />
      {children}
    </Suspense>
  </ThemeProvider>
</body>
```

- [ ] **Step 3: Update postcss.config.mjs**

Replace the entire file with:

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 4: Delete TwitchComponent.tsx**

```bash
rm "app/components/TwitchComponent.tsx"
```

- [ ] **Step 5: Uninstall Mantine packages**

```bash
npm uninstall @mantine/core @mantine/form @mantine/hooks @mantine/modals @mantine/spotlight
npm uninstall --save-dev postcss-preset-mantine postcss-simple-vars
```

- [ ] **Step 6: Install autoprefixer if not present**

```bash
npm install --save-dev autoprefixer
```

- [ ] **Step 7: Run full build to confirm clean**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors and no Mantine-related warnings.

- [ ] **Step 8: Smoke test**

```bash
npm run dev
```

Visit `/`, `/login`, `/signup`, `/rooms/all`, and a room URL. Confirm all pages render correctly.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: remove Mantine entirely, clean PostCSS config, delete TwitchComponent"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Global shell: ThemeProvider, VT323, layout — Task 2
- ✅ Header rewrite (next-themes, no Mantine) — Task 3
- ✅ Room page Spotify-style layout — Task 10
- ✅ AppSidebar with realtime room list, mobile Sheet — Task 6
- ✅ PlayerCard with upload/replace/remove, realtime sync — Task 7
- ✅ Chat restyle (own-message, font-mono, slide-in) — Tasks 8, 9
- ✅ Landing page (VT323 hero, updated copy, feature cards) — Task 11
- ✅ Auth pages (no Mantine, shadcn forms) — Task 12
- ✅ Rooms list (no Mantine Table, card list, stagger) — Task 13
- ✅ Full Mantine removal + PostCSS cleanup — Task 14
- ✅ `font-display` Tailwind utility — Task 2
- ✅ `darkMode: 'class'` Tailwind config — Task 2
- ✅ Twitch username field removed from CreateRoom — Task 5
- ✅ ConditionalHeader hides global nav on room pages — Task 10

**Type consistency:**
- `PlayerRoom` interface defined in `PlayerCard.tsx` — `room.audio_url`, `room.audio_filename` used consistently with the select in `page.tsx`
- `AppSidebarProps`: `roomId: string`, `currentUsername: string | null`, `isOwner: boolean` — matches props passed in room `page.tsx`
- `ChatInput` props `room_id: string`, `user_id: string` — unchanged from original, matches `ChatContainer` usage

**Placeholder scan:** No TBDs, no "implement later", no "similar to Task N" references.
