import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-play-blue via-kvp-blue-700 to-deep-play-blue flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-explorer-teal/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-adventure-orange/10 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-adventure-orange flex items-center justify-center">
              <span className="text-white font-bold text-xl">KV</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">KidVenture Pass</h1>
              <p className="text-white/60 text-sm">Partner Dashboard</p>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}
