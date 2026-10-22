import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, UserCheck, Briefcase } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const user = await login(email, password);
      // Route based on authenticated user's role
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLocalError('');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-slate-500 text-xs mt-1">Select a demo persona or enter credentials</p>
      </div>

      {isExpired && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Your session has expired. Please log in again.</span>
        </div>
      )}

      {localError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{localError}</span>
        </div>
      )}

      {/* Quick Demo Persona Switcher */}
      <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Click Demo Personas:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => autofill('admin@example.com', 'Admin123!')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-[11px] font-semibold text-rose-700 transition-colors shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 mb-1 text-rose-600" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => autofill('agent@example.com', 'Agent123!')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-brand-50 hover:bg-brand-100/80 border border-brand-200 text-[11px] font-semibold text-brand-700 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 mb-1 text-brand-600" />
            <span>Agent</span>
          </button>
          <button
            type="button"
            onClick={() => autofill('employee@example.com', 'Employee123!')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[11px] font-semibold text-emerald-700 transition-colors shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5 mb-1 text-emerald-600" />
            <span>Employee</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@example.com"
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Workspace</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Need an employee account?{' '}
        <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-4">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;
