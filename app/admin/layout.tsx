import AdminSidebar from "@/components/admin/adminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}