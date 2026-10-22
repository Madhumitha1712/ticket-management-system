import React, { useState } from 'react';
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
  Activity,
  Layers,
  Zap,
  TrendingUp,
  Cpu,
  FileText,
} from 'lucide-react';

const THEMES = {
  ice: {
    id: 'ice',
    label: 'Electric Azure',
    pillColor: 'bg-sky-500',
    canvasBg: 'bg-gradient-to-br from-[#D8E8F8] via-[#E6F0FB] to-[#D5E5F7]',
    headerBg: 'bg-[#E3EFFB]/90 border-blue-200/90',
    cardBg: 'bg-[#F4F8FD]/95 border-2 border-blue-200/90 hover:border-blue-300 shadow-md',
    accentText: 'from-blue-700 via-indigo-600 to-violet-700',
    tagBg: 'bg-blue-100/90 text-blue-900 border-blue-300/80',
    gridColor: '#93c5fd',
  },
  sand: {
    id: 'sand',
    label: 'Warm Sand',
    pillColor: 'bg-amber-500',
    canvasBg: 'bg-gradient-to-br from-[#EAE2D5] via-[#F4EFE6] to-[#E3DACB]',
    headerBg: 'bg-[#EFEAE2]/90 border-amber-300/90',
    cardBg: 'bg-[#FAF6F0]/95 border-2 border-amber-300/80 hover:border-amber-400 shadow-md',
    accentText: 'from-amber-800 via-orange-700 to-stone-800',
    tagBg: 'bg-amber-100/90 text-amber-950 border-amber-300/80',
    gridColor: '#d6c7b2',
  },
  sage: {
    id: 'sage',
    label: 'Sage Mint',
    pillColor: 'bg-emerald-500',
    canvasBg: 'bg-gradient-to-br from-[#D8EDE2] via-[#EAF5EF] to-[#D3ECE0]',
    headerBg: 'bg-[#E1F3EA]/90 border-emerald-300/90',
    cardBg: 'bg-[#F2FAF6]/95 border-2 border-emerald-300/80 hover:border-emerald-400 shadow-md',
    accentText: 'from-emerald-800 via-teal-700 to-green-800',
    tagBg: 'bg-emerald-100/90 text-emerald-950 border-emerald-300/80',
    gridColor: '#a7d9be',
  },
  lavender: {
    id: 'lavender',
    label: 'Iris Violet',
    pillColor: 'bg-purple-500',
    canvasBg: 'bg-gradient-to-br from-[#E4DEF6] via-[#EFEBF9] to-[#E0D8F4]',
    headerBg: 'bg-[#EAE4F8]/90 border-purple-300/90',
    cardBg: 'bg-[#F6F2FB]/95 border-2 border-purple-300/80 hover:border-purple-400 shadow-md',
    accentText: 'from-purple-800 via-indigo-700 to-violet-800',
    tagBg: 'bg-purple-100/90 text-purple-950 border-purple-300/80',
    gridColor: '#c4b5fd',
  },
};

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    <div className={`min-h-screen ${theme.canvasBg} text-slate-900 selection:bg-brand-600 selection:text-white relative overflow-hidden font-sans transition-colors duration-300`}>
      {/* High-Tech Background Grid Matrix */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(${theme.gridColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radiant Glowing Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[350px] bg-sky-400/25 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-indigo-400/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-300/20 blur-[100px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${theme.headerBg} border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform duration-200">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-950 flex items-center gap-2">
                IT ServiceDesk
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-brand-800 border border-blue-300/80 shadow-2xs">
                  ITSM v2.0
                </span>
              </span>
              <p className="text-[11px] text-slate-600 font-semibold">IT Service & Ticket Management System</p>
            </div>
          </Link>

          {/* Theme Palette Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 border border-blue-200/90 shadow-xs">
            <Palette className="w-3.5 h-3.5 text-slate-500 ml-2 mr-0.5" />
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  currentTheme === t.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md shadow-slate-900/15 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-brand-700 hover:bg-white/80 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all"
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
      <section className="relative pt-14 pb-12 px-6 max-w-5xl mx-auto text-center">
        {/* Floating Tag */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.tagBg} text-xs font-extrabold mb-6 shadow-sm backdrop-blur-md`}>
          <Sparkles className="w-4 h-4 text-brand-700" />
          <span>Automated SLA Engines • Multi-Tier RBAC • Real-Time Incident Workflows</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.12]">
          Next-Gen IT Service &{' '}
          <span className={`bg-gradient-to-r ${theme.accentText} bg-clip-text text-transparent`}>
            Ticket Management System
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
          A centralized IT Service Management (ITSM) hub designed to streamline incident triage, enforce automated SLA resolution deadlines, and deliver flawless employee support.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#roles"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-600/25 hover:scale-[1.02] transition-all"
          >
            <span>Select Your Portal to Login</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/90 hover:bg-white border-2 border-slate-300 text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-all"
          >
            <span>Register New User</span>
          </Link>
        </div>

        {/* Creative Live Incident Simulation Widget (WOW Factor!) */}
        <div className="mt-12 max-w-2xl mx-auto p-5 rounded-3xl bg-white/90 border-2 border-blue-200 shadow-xl backdrop-blur-md text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                Live Incident Telemetry Simulator
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              #TKT-2084
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                  CRITICAL
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  IT Infrastructure
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                Primary Database Cluster High Latency Alert (&gt; 350ms)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">Assigned: Senior DevOps Engineering Lead</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0 sm:text-right">
              <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1 sm:justify-end">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>SLA Resolution Target</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono">00:14:32</div>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1 sm:ml-auto">
                <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Cards Section */}
      <section id="roles" className="py-12 pb-24 px-6 max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 bg-white/90 border border-slate-300 px-3.5 py-1.5 rounded-full shadow-xs">
            Portal Gateways
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Choose Your Gateway Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium">
            Three purpose-built interfaces tailored to distinct operational responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Admin Card */}
          <div className="relative group overflow-hidden rounded-3xl bg-white/95 border-2 border-rose-300 hover:border-rose-400 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600" />

            <div className="p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  ADMIN PORTAL
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 mb-1">Administrator</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                Executive analytics, dynamic SLA policies, department routing, and company-wide staff access management.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Real-Time SLA Compliance KPI Gauges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Configurable Priority Response Deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Agent Performance & CSAT Leaderboard</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => navigate('/login?role=ADMIN')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/25 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>Login as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Support Agent Card */}
          <div className="relative group overflow-hidden rounded-3xl bg-white/95 border-2 border-blue-300 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

            <div className="p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  RESOLVER DESK
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 mb-1">Support Specialist</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                Active incident queues, SLA breach countdown timers, internal diagnostic notes, and resolution actions.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Prioritized Incident Resolution Backlog</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Internal Staff Diagnostics vs Public Replies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Automatic Escalation Warnings Before Breach</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => navigate('/login?role=AGENT')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs shadow-lg shadow-brand-700/25 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>Login as Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Employee Card */}
          <div className="relative group overflow-hidden rounded-3xl bg-white/95 border-2 border-emerald-300 hover:border-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

            <div className="p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SELF-SERVICE
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 mb-1">Enterprise Employee</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                Submit IT/HR requests with attachments, monitor live status stages, converse with agents, and submit CSAT reviews.
              </p>

              <div className="space-y-2.5 text-xs text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>One-Click Incident Submission with Screenshots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transparent Resolution Stage Timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5-Star Service Quality Feedback</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => navigate('/login?role=EMPLOYEE')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>Login as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Register Prompt Callout */}
        <div className="mt-8 p-6 rounded-3xl bg-white/90 border-2 border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-sm font-black text-slate-950">Don't have an enterprise account yet?</p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">Register a user account to raise tickets and track corporate IT issues.</p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all shrink-0"
          >
            <span>Create New Account</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core Capabilities Showcase */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-300/80">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Designed for Mission-Critical Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
            Core capabilities powering the IT Service & Ticket Management engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/90 border-2 border-indigo-200/90 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-4 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-950 mb-1.5">Automated SLA Engines</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Dynamic response and resolution deadlines computed by priority with automated warning triggers before violation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border-2 border-sky-200/90 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center mb-4 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-950 mb-1.5">Dual-Channel Commenting</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Maintain private engineer diagnostic logs hidden from employees while offering crystal clear user updates.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border-2 border-amber-200/90 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-950 mb-1.5">Closed-Loop CSAT Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              1-to-5 star ratings and reviews collected immediately upon ticket resolution to feed real-time agent rankings.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t border-slate-300/80 py-8 px-6 text-xs text-slate-600 ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold">
          <p>© {new Date().getFullYear()} IT Service & Ticket Management System. Enterprise incident resolution platform.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-950 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-950 transition-colors">Register</Link>
            <a
              href="https://github.com/Madhumitha1712/ticket-management-system"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-900"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
