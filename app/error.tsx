"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="wrap section">
      <p className="eyebrow">PLEASE TRY AGAIN</p>
      <h1>Temporarily unavailable.</h1>
      <p>We couldn’t load the portfolio. Please try again in a moment.</p>
      <button className="button accent" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
