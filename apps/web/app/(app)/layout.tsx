import { AppSidebar } from "../../components/layouts/AppSidebar";
import AiMentorChat from "../../components/features/AiMentorChat";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AppSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
      <AiMentorChat />
    </div>
  );
}
