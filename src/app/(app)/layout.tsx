import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
