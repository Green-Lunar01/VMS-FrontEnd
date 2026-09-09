import { ProfileView } from "@/components/pages/ProfileView";

export default function SecurityProfilePage() {
  return <ProfileView role="security_officer" changePasswordHref="/security/profile/change-password" />;
}
