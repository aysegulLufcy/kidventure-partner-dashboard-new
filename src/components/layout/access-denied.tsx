import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui';

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-cream p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-deep-play-blue mb-3">
          Access Denied
        </h1>
        <p className="text-slate-500 mb-6">
          You don&apos;t have permission to access the Partner Dashboard. 
          Please contact your organization administrator if you believe this is an error.
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => window.location.href = 'mailto:support@kidventurepass.com'}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
