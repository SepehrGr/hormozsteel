'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
// FloatingOrderButton is temporarily disabled site-wide.
// To re-enable, uncomment the import below and the <FloatingOrderButton /> JSX at the bottom of this file.
// import FloatingOrderButton from '@/components/floating-order-button';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin pages: no navbar, footer, or floating button
    return <>{children}</>;
  }

  // Regular pages: show navbar, footer, and floating button
  return (
    <div className="relative flex flex-col">
      <Navbar />
      <main className="container flex-grow mx-auto max-w-8xl md:px-6">
        {children}
      </main>
      <Footer />
      {/* FloatingOrderButton is disabled. To re-enable, uncomment the import and the line below. */}
      {/* <FloatingOrderButton /> */}
    </div>
  );
}
