export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
};

export const TICKET_STATUS = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

export const TICKET_PRIORITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const STATUS_COLORS = {
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-purple-50 text-purple-700 border-purple-200',
  RESOLVED: 'bg-teal-50 text-teal-700 border-teal-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  REOPENED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const ROLE_BADGES = {
  ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
  AGENT: 'bg-brand-50 text-brand-700 border-brand-200',
  EMPLOYEE: 'bg-slate-100 text-slate-700 border-slate-200',
};
