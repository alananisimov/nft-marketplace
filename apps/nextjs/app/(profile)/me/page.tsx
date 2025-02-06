import { ProfileLayout } from "~/widgets/layouts/profile-layout";
import { ProfileView } from "~/features/profile/ui/profile-view";

export default function ProfilePage() {
  return (
    <ProfileLayout>
      <ProfileView className="mt-52 pb-6 pl-4" />
    </ProfileLayout>
  );
}
