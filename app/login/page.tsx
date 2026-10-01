import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="text-gray-500">
        Sign in with your Google account to see your dashboard and profile.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <GoogleSignInButton />
    </main>
  );
}
