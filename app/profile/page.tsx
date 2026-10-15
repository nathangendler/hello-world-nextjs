import { requireCompleteProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireCompleteProfile();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-7 sm:px-8">
      <span className="eyebrow">Profile</span>
      <h1 className="title mt-1 text-[28px] leading-tight">Your profile</h1>
      <p className="mt-1 text-[13px] text-subtle">Signed in as {profile.email}</p>
      <ProfileForm profile={profile} submitLabel="Save changes" redirectTo={null} />
    </main>
  );
}
