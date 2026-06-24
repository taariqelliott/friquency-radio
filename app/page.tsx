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
