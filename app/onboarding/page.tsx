import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isProfileComplete } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";

export default async function OnboardingPage() {
  const profile = await requireProfile();
  if (isProfileComplete(profile)) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-xl p-8">
      <h1 className="text-3xl font-bold">Welcome! Tell us your name</h1>
      <p className="mt-2 text-gray-500">
        We need your first and last name to finish setting up your account. You
        can add a photo and a short bio now or later.
      </p>
      <ProfileForm profile={profile} submitLabel="Finish setup" redirectTo="/dashboard" />
    </main>
  );
}
