import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, AlertOctagon, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SLA_BREACHED':
      case 'ESCALATION':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'SLA_WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'NEW_COMMENT':
        return <MessageSquare className="w-4 h-4 text-brand-400" />;
      case 'TICKET_RESOLVED':
        return <Check className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTicketLink = (ticketId) => {
    if (!ticketId) return '#';
    if (user?.role === 'ADMIN') return `/admin/tickets/${ticketId}`;
    if (user?.role === 'AGENT') return `/agent/tickets/${ticketId}`;
    return `/employee/tickets/${ticketId}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200/60">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No notifications to display
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                    !n.isRead ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200/60 shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="text-[10px] text-slate-400 hover:text-brand-600 cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.ticket && (
                        <Link
                          to={getTicketLink(n.ticket._id || n.ticket)}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center gap-0.5 font-medium"
                        >
                          View Ticket <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
