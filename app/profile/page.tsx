import { requireCompleteProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireCompleteProfile();

  return (
    <main className="mx-auto w-full max-w-xl p-8">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-2 text-gray-500">Signed in as {profile.email}</p>
      <ProfileForm profile={profile} submitLabel="Save changes" redirectTo={null} />
    </main>
  );
}
