// app/admin/page.tsx
import UsersSection from "@/components/admin/UsersSection/UsersSection";
import AjoGroupsSection from "@/components/admin/AjoGroupsSection/AjoGroupsSection";
import UserNavbar from "@/components/layout/UserNavbar";

export default function AdminPage() {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* This stays fixed at the top */}
      <UserNavbar />

      {/* This scrolls naturally */}
      <main className="p-4 space-y-6 flex-1">
        <UsersSection />
        <AjoGroupsSection />
        {/* Add more content here to test the scroll! */}
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          More Content
        </div>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          More more content...
        </div>
      </main>
    </div>
    
    
  );
}