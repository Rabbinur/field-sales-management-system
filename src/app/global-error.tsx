"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center font-sans">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-bold">System Runtime Halt</h2>
          <p className="text-xs text-slate-400">
            A critical exception occurred in the application shell.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold"
          >
            Recover Session
          </button>
        </div>
      </body>
    </html>
  );
}
