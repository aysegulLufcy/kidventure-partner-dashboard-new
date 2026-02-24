'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthSession } from '@/types';
import { supabase } from '@/lib/supabase';
import { mockUser } from '@/lib/mock-data';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password', '/verify-email', '/accept-invite'];

interface AuthContextType extends AuthSession {
  signOut: () => Promise<void>;
  isPartner: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    async function loadUser() {
      try {
        if (USE_MOCK_DATA) {
          // Use mock user in development
          await new Promise(resolve => setTimeout(resolve, 300));
          setUser(mockUser);
          setIsLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          // Extract custom claims from user metadata
          const metadata = session.user.user_metadata || {};
          const appMetadata = session.user.app_metadata || {};
          
          const userRole = appMetadata.role || metadata.role;
          
          // Check if user has partner role
          if (userRole !== 'partner_staff' && userRole !== 'partner_manager') {
            // Not a partner, sign them out and redirect
            await supabase.auth.signOut();
            if (!isPublicRoute) {
              router.push('/login');
            }
            setUser(null);
            setIsLoading(false);
            return;
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: userRole,
            partnerOrgId: appMetadata.partner_org_id || metadata.partner_org_id || '',
            firstName: metadata.first_name,
            lastName: metadata.last_name,
            avatarUrl: metadata.avatar_url,
          });
        } else if (!isPublicRoute) {
          // No session and trying to access protected route
          router.push('/login');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
        if (!isPublicRoute) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Subscribe to auth changes
    if (!USE_MOCK_DATA) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            router.push('/login');
          } else if (event === 'SIGNED_IN' && session?.user) {
            const metadata = session.user.user_metadata || {};
            const appMetadata = session.user.app_metadata || {};
            const userRole = appMetadata.role || metadata.role;
            
            if (userRole === 'partner_staff' || userRole === 'partner_manager') {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: userRole,
                partnerOrgId: appMetadata.partner_org_id || metadata.partner_org_id || '',
                firstName: metadata.first_name,
                lastName: metadata.last_name,
                avatarUrl: metadata.avatar_url,
              });
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Update user on token refresh
            const metadata = session.user.user_metadata || {};
            const appMetadata = session.user.app_metadata || {};
            
            setUser(prev => prev ? {
              ...prev,
              firstName: metadata.first_name || prev.firstName,
              lastName: metadata.last_name || prev.lastName,
            } : null);
          } else if (event === 'PASSWORD_RECOVERY') {
            // User clicked password reset link
            router.push('/reset-password');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router, isPublicRoute, pathname]);

  const signOut = async () => {
    if (USE_MOCK_DATA) {
      setUser(null);
      router.push('/login');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const isPartner = user?.role === 'partner_staff' || user?.role === 'partner_manager';
  const isManager = user?.role === 'partner_manager';

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signOut, isPartner, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
