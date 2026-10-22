import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from '../components/notifications/NotificationBell.jsx';
import {
  LifeBuoy,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  Clock,
  Tags,
  AlertOctagon,
  Award,
  UserCheck,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert,
} from 'lucide-react';
import { ROLE_BADGES } from '../utils/constants.js';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define navigation items based on User Role
  const getNavLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
          { to: '/admin/tickets', icon: Ticket, label: 'All Tickets' },
          { to: '/admin/escalations', icon: AlertOctagon, label: 'SLA Escalations' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/categories', icon: Tags, label: 'Categories' },
          { to: '/admin/sla', icon: Clock, label: 'SLA Rules' },
          { to: '/admin/leaderboard', icon: Award, label: 'Agent Leaderboard' },
        ];
      case 'AGENT':
        return [
          { to: '/agent/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
          { to: '/agent/tickets', icon: Ticket, label: 'Assigned Queue' },
          { to: '/agent/profile', icon: User, label: 'My Profile' },
        ];
      case 'EMPLOYEE':
      default:
        return [
          { to: '/employee/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
          { to: '/employee/tickets', icon: Ticket, label: 'My Raised Tickets' },
          { to: '/employee/tickets/new', icon: PlusCircle, label: 'Raise New Ticket' },
          { to: '/employee/profile', icon: User, label: 'My Profile' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-[#E8F1FA] flex text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#F1F6FC] border-r border-[#CBDCF0] shrink-0 shadow-sm">
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#CBDCF0]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/25">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-tight text-slate-900">IT ServiceDesk</h2>
            <p className="text-[10px] text-brand-700 font-bold uppercase tracking-wider">{user?.role} Portal</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('dashboard')}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-600/20'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-[#DEECFA] font-semibold'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-[#CBDCF0]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#E1EDF9] border border-[#CBDCF0] mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-600 font-medium truncate">{user?.department}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#F1F6FC]/90 backdrop-blur-md border-b border-[#CBDCF0] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-[#DEECFA]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md border ${ROLE_BADGES[user?.role] || ''}`}>
                {user?.role}
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-600 font-semibold">
                Dept: <strong className="text-slate-900">{user?.department}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {user?.role === 'EMPLOYEE' && (
              <Link
                to="/employee/tickets/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Raise Ticket
              </Link>
            )}

            {/* In-App Live Notifications */}
            <NotificationBell />

            {/* Profile Avatar link */}
            <Link
              to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'AGENT' ? '/agent/profile' : '/employee/profile'}
              className="flex items-center gap-2 pl-2 border-l border-[#CBDCF0] hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 z-40 shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
