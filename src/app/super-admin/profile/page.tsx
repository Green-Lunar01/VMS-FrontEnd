import { ProfileView } from "@/components/pages/ProfileView";

export default function SuperAdminProfilePage() {
  return <ProfileView role="super_admin" changePasswordHref="/super-admin/profile/change-password" />;
}
