import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LifeBuoy,
  Shield,
  UserCheck,
  Briefcase,
  Zap,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Star,
  ExternalLink,
} from 'lucide-react';

export const LandingPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // 1-Click Fast Login directly from Landing Page
  const handleQuickLogin = async (email, password, fallbackRoute) => {
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedUser.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-brand-500/20 to-purple-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Enterprise Desk
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  v2.0 SLA
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Intelligent Incident Ops</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#roles" className="hover:text-white transition-colors">Role Workflows</a>
            <a href="#demo" className="hover:text-white transition-colors">Instant Demo</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto text-center">
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time SLA Engines • Multi-Tier RBAC • CSAT Scoring</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Enterprise Support &{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
            Incident Management
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Empower employees to report issues, enable support engineers to resolve tickets before SLA breaches, and equip admins with live audit compliance analytics.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? getDashboardLink() : "/login"}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all"
          >
            <span>Launch Live Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Try 1-Click Demo Accounts</span>
          </a>
        </div>

        {/* Live Metrics Showcase Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</p>
            <p className="text-[11px] text-slate-400 mt-1">SLA On-Time Resolution</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">&lt; 15m</p>
            <p className="text-[11px] text-slate-400 mt-1">Avg First Response Time</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">4.9 / 5</p>
            <p className="text-[11px] text-slate-400 mt-1">CSAT Customer Satisfaction</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">100%</p>
            <p className="text-[11px] text-slate-400 mt-1">Audit Trail History</p>
          </div>
        </div>
      </section>

      {/* Instant 1-Click Demo Switcher Section */}
      <section id="demo" className="py-20 px-6 max-w-6xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Evaluation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Test Drive Any Role Instantly
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Click any persona below to authenticate automatically without manually typing passwords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Persona */}
          <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-500/60 transition-all duration-300 shadow-xl shadow-rose-950/20">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">System Administrator</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Full executive analytics, SLA rule configurations, department category setup, and staff role management.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 mb-5 space-y-1">
              <div>Email: <span className="text-rose-300">admin@example.com</span></div>
              <div>Password: <span className="text-slate-200">Admin123!</span></div>
            </div>
            <button
              onClick={() => handleQuickLogin('admin@example.com', 'Admin123!', '/admin/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <span>Login as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Support Agent Persona */}
          <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 shadow-xl shadow-indigo-950/20">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Support Specialist</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Assigned ticket queue, countdown resolution timers, internal troubleshooting notes, and customer chat.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 mb-5 space-y-1">
              <div>Email: <span className="text-indigo-300">agent@example.com</span></div>
              <div>Password: <span className="text-slate-200">Agent123!</span></div>
            </div>
            <button
              onClick={() => handleQuickLogin('agent@example.com', 'Agent123!', '/agent/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Login as Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Employee Persona */}
          <div className="relative group p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 shadow-xl shadow-emerald-950/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Enterprise Employee</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                EMPLOYEE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Raise IT/HR tickets with attachments, track live progress, collaborate with agents, and rate satisfaction.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 mb-5 space-y-1">
              <div>Email: <span className="text-emerald-300">employee@example.com</span></div>
              <div>Password: <span className="text-slate-200">Employee123!</span></div>
            </div>
            <button
              onClick={() => handleQuickLogin('employee@example.com', 'Employee123!', '/employee/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Login as Employee</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Modern Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Eliminate chaotic spreadsheets and lost emails with an enterprise-grade incident lifecycle engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated SLA Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates dynamic response and resolution deadlines based on priority. Automatically triggers escalation alerts when tickets approach violation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Internal & Public Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Support engineers can share private diagnostic notes hidden from end-users, while maintaining transparent customer-facing updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Closed-Loop CSAT Ratings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Employees provide 1-5 star ratings and written feedback upon resolution, feeding the real-time agent performance leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture & Tech Stack */}
      <section id="architecture" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800/80 text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight mb-4">
          Robust Full-Stack MERN Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-10">
          Built with clean RESTful architecture, MongoDB schemas, JWT authentication, and high-performance React client.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">React 18 + Vite</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Tailwind CSS</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Node.js + Express</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">MongoDB + Mongoose</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">JWT + RBAC</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Multer File Uploads</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Enterprise Desk. Built for high-velocity teams.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
            <a
              href="https://github.com/Madhumitha1712/ticket-management-system"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
