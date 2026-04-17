import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <AppHeader />
        <main className="flex-1 p-6 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
