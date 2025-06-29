import { AppHeader } from "@/components/app-header";
import { RouteGuard } from "@/components/route-guard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard role="student">
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
