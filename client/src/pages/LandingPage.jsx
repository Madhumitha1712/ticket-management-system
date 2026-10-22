import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LifeBuoy,
  Shield,
  UserCheck,
  Briefcase,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BarChart3,
} from 'lucide-react';

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50/40 to-indigo-50/50 text-slate-800 selection:bg-brand-500 selection:text-white relative overflow-hidden font-sans">
      {/* Soft Ambient Background Glows (Tinted Light Theme) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-brand-300/25 via-indigo-200/30 to-purple-200/20 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-100/80 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2">
                Enterprise Desk
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 border border-brand-200">
                  SLA v2.0
                </span>
              </span>
              <p className="text-[11px] text-slate-500">Intelligent Incident Ops</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#roles" className="hover:text-brand-600 transition-colors">Select Role</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Platform Features</a>
            <a href="#workflow" className="hover:text-brand-600 transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-slate-200/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
                >
                  <span>Register</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-5xl mx-auto text-center">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Role-Based Access Control • SLA Automation • Closed-Loop Feedback</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Modern Incident Resolution &{' '}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Ticket Management
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Select your portal role below to sign in to your workspace, or register a new user account to get started with instant ticket tracking.
        </p>

        {/* Quick Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#roles"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 hover:scale-[1.01] transition-all"
          >
            <span>Choose Your Role to Log In</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/90 hover:bg-white border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all"
          >
            <span>Register New User</span>
          </Link>
        </div>
      </section>

      {/* Role Selection Cards Section */}
      <section id="roles" className="py-12 px-6 max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200/80 px-3 py-1 rounded-full">
            Role Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Select Your Role to Continue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Click your designated role to enter your credentials on the login screen, or create a new user profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="relative flex flex-col justify-between p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200 hover:border-rose-300 transition-all duration-200 shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Administrator</h3>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Manage organization-wide ticket queues, reassign tickets, configure SLA policies, and supervise agent performance.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Executive SLA Compliance Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>User & Department Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Category & SLA Policy Config</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=ADMIN')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <span>Login as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Support Agent Card */}
          <div className="relative flex flex-col justify-between p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-brand-200 hover:border-brand-300 transition-all duration-200 shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Support Agent</h3>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  AGENT
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Dedicated incident queue with SLA countdown timers, private diagnostic notes, and direct resolution workflows.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Prioritized Assigned Ticket Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Internal Diagnostics & Public Replies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>Live SLA Countdown Timers</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=AGENT')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all cursor-pointer"
            >
              <span>Login as Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Employee Card */}
          <div className="relative flex flex-col justify-between p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Employee</h3>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  EMPLOYEE
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Submit IT, HR, or equipment issues with screenshots, track live resolution status, and submit CSAT reviews.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Quick Issue Submission with Files</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Live Resolution Progress Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>5-Star CSAT Rating upon Completion</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=EMPLOYEE')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Login as Employee</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Register Prompt Callout */}
        <div className="mt-8 p-4 rounded-2xl bg-white/80 border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">Don't have an employee account yet?</p>
            <p className="text-[11px] text-slate-500">Sign up in seconds to start reporting incidents and tracking service requests.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <span>Create New Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Transparent Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Key capabilities engineered into the Enterprise Desk incident engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/80 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Automated SLA Policies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically sets response & resolution deadlines by priority, alerting managers before breach thresholds are passed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Internal & Public Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agents can record private diagnostic steps hidden from employees while maintaining clean customer-facing communications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Closed-Loop CSAT</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Employees provide 1-5 star ratings upon resolution, ensuring accountability and measurable service quality.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-8 px-6 text-xs text-slate-500 bg-slate-100/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Enterprise Desk. Role-Based Support System.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-800 transition-colors font-medium">Sign In</Link>
            <Link to="/register" className="hover:text-slate-800 transition-colors font-medium">Register</Link>
            <a
              href="https://github.com/Madhumitha1712/ticket-management-system"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
