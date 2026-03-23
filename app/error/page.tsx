export default function ErrorPage() {
  return (
    <main className="app-page app-page-center">
      <div className="app-shell-narrow">
        <section className="app-panel text-center">
          <div className="app-kicker mb-3">Error</div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="app-copy">Please try again in a moment.</p>
        </section>
      </div>
    </main>
  );
}
