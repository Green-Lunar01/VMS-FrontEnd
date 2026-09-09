import { ProfileView } from "@/components/pages/ProfileView";

export default function HostProfilePage() {
  return <ProfileView role="host" changePasswordHref="/host/profile/change-password" />;
}
