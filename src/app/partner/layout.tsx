'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar, AccessDenied } from '@/components/layout';
import { LoadingState } from '@/components/ui/states';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isPartner } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-cream">
        <LoadingState message="Loading partner dashboard..." />
      </div>
    );
  }

  // Show access denied if not a partner
  if (!user || !isPartner) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
