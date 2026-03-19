import { Header } from "./Header";
import { Footer } from "./Footer";
import { OrganizationSchema } from "./StructuredData";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
