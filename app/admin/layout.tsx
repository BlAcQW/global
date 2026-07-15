export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,#f3f5f9_0%,#dfe4ec_100%)] text-[#0d1622]">
      {children}
    </div>
  );
}
