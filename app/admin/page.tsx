// app/admin/page.tsx
import UsersSection from "@/components/admin/UsersSection/UsersSection";
import AjoGroupsSection from "@/components/admin/AjoGroupsSection/AjoGroupsSection";

export default function AdminPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Admin Control Panel</h1>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">User Management</h2>
        <UsersSection />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Ajo Group Management</h2>
        <AjoGroupsSection />
      </section>
    </div>
  );
}