interface LayoutProps {
  children: React.ReactNode;
}
function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#0f172a]  to-[#334155]">
      {children}
    </div>
  );
}

export default AuthLayout;
