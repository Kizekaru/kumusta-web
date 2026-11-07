import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background px-4">
      <h1 className="text-4xl font-mono text-accent-rose font-bold mb-4">403: UNAUTHORIZED</h1>
      <p className="text-gray-400 mb-8 max-w-md font-sans">
        You do not have the required role privileges to access this observer control room. Please log in with a credential mapped to the correct civic access tier.
      </p>
      <Link href="/" className="px-6 py-3 rounded-lg border border-border bg-zinc-900 text-white font-mono hover:bg-zinc-800 transition">
        Return Home
      </Link>
    </div>
  );
}
