export const metadata = { title: "Privacy Policy | Caption This" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-8">
      <h1 className="title text-[28px] leading-tight">Privacy Policy</h1>
      <p className="mt-1 text-[12px] text-subtle">Last updated October 15, 2026</p>

      <div className="mt-5 flex flex-col gap-4 text-[14px] leading-relaxed">
        <p>
          Caption This is a student demo application. This page explains what
          information it collects and how that information is used.
        </p>
        <h2 className="title text-[17px]">Information we collect</h2>
        <p>
          When you sign in with Google, we receive your email address and basic
          Google profile information. You may also choose to give us your first
          name, last name, a short bio, a profile photo, and the photos you upload
          for captions.
        </p>
        <h2 className="title text-[17px]">How we use it</h2>
        <p>
          Your information is used only to sign you in and to display your
          profile to you inside the app. It is not sold, shared with third
          parties, or used for advertising.
        </p>
        <h2 className="title text-[17px]">Where it is stored</h2>
        <p>
          Account and profile data is stored with Supabase. The app is hosted on
          Vercel. Profile photos you upload are stored at a public URL.
        </p>
        <h2 className="title text-[17px]">Deleting your data</h2>
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
