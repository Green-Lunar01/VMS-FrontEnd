import { ProfileView } from "@/components/pages/ProfileView";

export default function AdminProfilePage() {
  return <ProfileView role="institution_admin" changePasswordHref="/admin/profile/change-password" />;
}
