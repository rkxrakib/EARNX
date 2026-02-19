import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EarnFast - Admin Panel",
  description: "Admin panel for managing EarnFast app",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
