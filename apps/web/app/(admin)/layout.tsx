import { AppSidebar } from "../../components/layouts/AppSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AppSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        <div className="bg-accent-purple/10 border-b border-accent-purple/20 px-8 py-2 text-center text-xs font-semibold text-accent-purple font-mono tracking-wider flex items-center justify-center gap-2">
          <span>⚙️ SYSTEM ADMINISTRATOR PRIVILEGES ACTIVE</span>
        </div>
        {children}
      </main>
    </div>
  );
}
