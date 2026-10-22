import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Shield,
  UserCheck,
  Briefcase,
  UserPlus,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const ROLE_META = {
  ADMIN: {
    title: 'Administrator Portal',
    subtitle: 'Sign in to access analytics, SLA rules, and system oversight',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    buttonClass: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
    icon: Shield,
    defaultEmail: 'admin@example.com',
  },
  AGENT: {
    title: 'Support Agent Workspace',
    subtitle: 'Sign in to review assigned tickets and resolve customer issues',
    color: 'brand',
    badgeClass: 'bg-brand-50 text-brand-700 border-brand-200',
    buttonClass: 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20',
    icon: UserCheck,
    defaultEmail: 'agent@example.com',
  },
  EMPLOYEE: {
    title: 'Employee Self-Service',
    subtitle: 'Sign in to submit incidents and track your request status',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
    icon: Briefcase,
    defaultEmail: 'employee@example.com',
  },
};

export const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role')?.toUpperCase();
  const [selectedRole, setSelectedRole] = useState(
    ROLE_META[initialRole] ? initialRole : 'EMPLOYEE'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Synchronize when query parameter changes
  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (ROLE_META[roleParam]) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    setLocalError('');
  };

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
      setLocalError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    if (selectedRole === 'ADMIN') {
      setEmail('admin@example.com');
      setPassword('Admin123!');
    } else if (selectedRole === 'AGENT') {
      setEmail('agent@example.com');
      setPassword('Agent123!');
    } else {
      setEmail('employee@example.com');
      setPassword('Employee123!');
    }
    setLocalError('');
  };

  const currentMeta = ROLE_META[selectedRole] || ROLE_META.EMPLOYEE;
  const RoleIcon = currentMeta.icon;

  return (
    <div>
      {/* Role Selection Tabs */}
      <div className="mb-6">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
          Logging in as:
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('EMPLOYEE')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'EMPLOYEE'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Employee</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('AGENT')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'AGENT'
                ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'ADMIN'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Role Title & Subtitle */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase border mb-2 border-slate-200 bg-slate-50 text-slate-700">
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{selectedRole} Portal</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">{currentMeta.title}</h2>
        <p className="text-slate-500 text-xs mt-1">{currentMeta.subtitle}</p>
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`e.g. ${currentMeta.defaultEmail}`}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Account Password
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
          className={`w-full mt-2 py-2.5 px-4 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${currentMeta.buttonClass}`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In as {selectedRole}</span>
            </>
          )}
        </button>
      </form>

      {/* Prominent Register Callout */}
      <div className="mt-6 pt-5 border-t border-slate-200/80 text-center space-y-2">
        <p className="text-xs text-slate-600">
          Don't have an account yet?
        </p>
        <Link
          to={`/register?role=${selectedRole}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 border border-brand-200 px-3.5 py-1.5 rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register New User Account</span>
        </Link>
      </div>

      {/* Discreet Demo Helper (for evaluation testing without forcing) */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => setShowDemoHelp(!showDemoHelp)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <HelpCircle className="w-3 h-3" />
          <span>{showDemoHelp ? 'Hide test credentials' : 'Need demo testing credentials?'}</span>
        </button>

        {showDemoHelp && (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-600 flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800">Seed Demo Account ({selectedRole}):</p>
              <p className="font-mono text-slate-500 text-[10px]">{currentMeta.defaultEmail} / {selectedRole === 'ADMIN' ? 'Admin123!' : selectedRole === 'AGENT' ? 'Agent123!' : 'Employee123!'}</p>
            </div>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 cursor-pointer"
            >
              Autofill
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
