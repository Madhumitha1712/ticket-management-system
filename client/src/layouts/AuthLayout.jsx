import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, LifeBuoy } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 shadow-lg shadow-brand-500/25 mb-4 border border-brand-400/30">
            <LifeBuoy className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Desk
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Smart Role-Based IT Support & SLA Management Platform
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-dropdown border border-slate-200/90">
          <Outlet />
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-1 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured with JWT Dual-Layer RBAC & MongoDB Persistence</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
