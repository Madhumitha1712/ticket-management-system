import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Palette,
} from 'lucide-react';

const THEMES = {
  ice: {
    id: 'ice',
    label: 'Glacier Blue',
    pillColor: 'bg-sky-400',
    canvasBg: 'bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200',
    headerBg: 'bg-sky-200/90 border-sky-300',
    cardBg: 'bg-white/95 border-sky-300/80 hover:border-sky-400',
    bannerBg: 'bg-sky-100/90 border-sky-300 text-sky-900',
    tagBg: 'bg-sky-300/60 text-sky-950 border-sky-400/80',
    textGradient: 'from-blue-700 via-indigo-700 to-sky-700',
  },
  sand: {
    id: 'sand',
    label: 'Warm Sand',
    pillColor: 'bg-amber-400',
    canvasBg: 'bg-gradient-to-br from-amber-200 via-orange-100 to-stone-200',
    headerBg: 'bg-amber-200/90 border-amber-300',
    cardBg: 'bg-white/95 border-amber-300/80 hover:border-amber-400',
    bannerBg: 'bg-amber-100/90 border-amber-300 text-amber-900',
    tagBg: 'bg-amber-300/60 text-amber-950 border-amber-400/80',
    textGradient: 'from-amber-800 via-orange-800 to-stone-800',
  },
  sage: {
    id: 'sage',
    label: 'Sage Mint',
    pillColor: 'bg-emerald-400',
    canvasBg: 'bg-gradient-to-br from-emerald-200 via-teal-100 to-green-200',
    headerBg: 'bg-emerald-200/90 border-emerald-300',
    cardBg: 'bg-white/95 border-emerald-300/80 hover:border-emerald-400',
    bannerBg: 'bg-emerald-100/90 border-emerald-300 text-emerald-900',
    tagBg: 'bg-emerald-300/60 text-emerald-950 border-emerald-400/80',
    textGradient: 'from-emerald-800 via-teal-800 to-green-800',
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender',
    pillColor: 'bg-purple-400',
    canvasBg: 'bg-gradient-to-br from-purple-200 via-indigo-100 to-violet-200',
    headerBg: 'bg-purple-200/90 border-purple-300',
    cardBg: 'bg-white/95 border-purple-300/80 hover:border-purple-400',
    bannerBg: 'bg-purple-100/90 border-purple-300 text-purple-900',
    tagBg: 'bg-purple-300/60 text-purple-950 border-purple-400/80',
    textGradient: 'from-purple-800 via-indigo-800 to-violet-800',
  },
};

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load saved theme or default to Glacier Blue
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-light-theme') || 'ice';
  });

  const theme = THEMES[currentTheme] || THEMES.ice;

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app-light-theme', themeId);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className={`min-h-screen ${theme.canvasBg} text-slate-800 selection:bg-brand-600 selection:text-white relative overflow-hidden font-sans transition-colors duration-300`}>
      {/* Decorative ambient color layers */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[600px] h-[300px] bg-white/30 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-white/20 blur-3xl pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${theme.headerBg} border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-700 flex items-center justify-center shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform duration-200">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2">
                Enterprise Desk
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-brand-800 border border-slate-300/80 shadow-2xs">
                  SLA v2.0
                </span>
              </span>
              <p className="text-[11px] text-slate-600 font-medium">Incident & Operations Center</p>
            </div>
          </Link>

          {/* Theme Color Picker in Navbar */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-white/80 border border-slate-300/80 shadow-2xs">
            <Palette className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                title={`Switch to ${t.label}`}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentTheme === t.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${t.pillColor}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-brand-800 hover:bg-white/80 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all"
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
      <section className="relative pt-16 pb-16 px-6 max-w-5xl mx-auto text-center">
        {/* Floating Tag */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.tagBg} text-xs font-bold mb-6 shadow-xs backdrop-blur-sm`}>
          <Sparkles className="w-3.5 h-3.5 text-brand-700" />
          <span>Role-Based Access Control • SLA Automation • Closed-Loop Feedback</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
          Modern Incident Resolution &{' '}
          <span className={`bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
            Ticket Management
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
          A centralized portal for enterprise service requests. Select your designated role below to enter your credentials or create a new user profile.
        </p>

        {/* Mobile Theme Switcher Bar */}
        <div className="lg:hidden mt-6 inline-flex items-center gap-1 p-1 rounded-xl bg-white/90 border border-slate-300 shadow-2xs">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                currentTheme === t.id ? 'bg-slate-900 text-white' : 'text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Role Selection Cards Section */}
      <section id="roles" className="py-6 pb-20 px-6 max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-white/80 border border-slate-300 px-3 py-1 rounded-full shadow-2xs">
            Role Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mt-3">
            Select Your Role to Continue
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium">
            Click your role below to open the sign-in screen, or register for a new account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className={`relative flex flex-col justify-between p-7 rounded-2xl ${theme.cardBg} border-2 shadow-md hover:shadow-lg transition-all duration-200`}>
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-950">Administrator</h3>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
                Manage organization-wide ticket queues, reassign tickets, configure SLA policies, and supervise agent performance.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Executive SLA Compliance Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>User & Department Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Category & SLA Policy Config</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=ADMIN')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <span>Login as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Support Agent Card */}
          <div className={`relative flex flex-col justify-between p-7 rounded-2xl ${theme.cardBg} border-2 shadow-md hover:shadow-lg transition-all duration-200`}>
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-950">Support Agent</h3>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  AGENT
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
                Dedicated incident queue with SLA countdown timers, private diagnostic notes, and direct resolution workflows.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Prioritized Assigned Ticket Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Internal Diagnostics & Public Replies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Live SLA Countdown Timers</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=AGENT')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md shadow-brand-700/30 transition-all cursor-pointer"
            >
              <span>Login as Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Employee Card */}
          <div className={`relative flex flex-col justify-between p-7 rounded-2xl ${theme.cardBg} border-2 shadow-md hover:shadow-lg transition-all duration-200`}>
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-950">Employee</h3>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  EMPLOYEE
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
                Submit IT, HR, or equipment issues with screenshots, track live resolution status, and submit CSAT reviews.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Quick Issue Submission with Files</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live Resolution Progress Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>5-Star CSAT Rating upon Completion</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login?role=EMPLOYEE')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Login as Employee</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Register Prompt Callout */}
        <div className={`mt-8 p-5 rounded-2xl ${theme.cardBg} border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm`}>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-950">Don't have an employee account yet?</p>
            <p className="text-xs text-slate-600 mt-0.5">Register a new profile in seconds to submit and track support incidents.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <span>Create New Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-300/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Built for Transparent Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium">
            Key capabilities engineered into the Enterprise Desk incident engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl ${theme.cardBg} border-2 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Automated SLA Policies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically sets response & resolution deadlines by priority, alerting managers before breach thresholds are passed.
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${theme.cardBg} border-2 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Internal & Public Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agents can record private diagnostic steps hidden from employees while maintaining clean customer-facing communications.
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${theme.cardBg} border-2 shadow-xs`}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
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
      <footer className={`border-t border-slate-300/80 py-8 px-6 text-xs text-slate-600 ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <p>© {new Date().getFullYear()} Enterprise Desk. Role-Based Support System.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-900 transition-colors font-bold">Sign In</Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors font-bold">Register</Link>
            <a
              href="https://github.com/Madhumitha1712/ticket-management-system"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-800 hover:text-brand-900 font-bold"
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
