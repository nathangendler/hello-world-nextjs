export const metadata = { title: "Privacy Policy | Hello World" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated October 1, 2026</p>

      <div className="mt-6 flex flex-col gap-4">
        <p>
          Hello World is a student demo application. This page explains what
          information it collects and how that information is used.
        </p>
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <p>
          When you sign in with Google, we receive your email address and basic
          Google profile information. You may also choose to give us your first
          name, last name, a short bio, and a profile photo.
        </p>
        <h2 className="text-xl font-semibold">How we use it</h2>
        <p>
          Your information is used only to sign you in and to display your
          profile to you inside the app. It is not sold, shared with third
          parties, or used for advertising.
        </p>
        <h2 className="text-xl font-semibold">Where it is stored</h2>
        <p>
          Account and profile data is stored with Supabase. The app is hosted on
          Vercel. Profile photos you upload are stored at a public URL.
        </p>
        <h2 className="text-xl font-semibold">Deleting your data</h2>
        <p>
          To have your account and profile removed, open an issue on the{" "}
          <a
            className="underline"
            href="https://github.com/nathangendler/hello-world-nextjs"
          >
            project repository
          </a>
          .
        </p>
      </div>
    </main>
  );
}
