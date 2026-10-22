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

export const SLA_STATUS = {
  PENDING: 'PENDING',
  MET: 'MET',
  BREACHED: 'BREACHED',
};

export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  NEW_COMMENT: 'NEW_COMMENT',
  STATUS_UPDATED: 'STATUS_UPDATED',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACHED: 'SLA_BREACHED',
  ESCALATION: 'ESCALATION',
  TICKET_RESOLVED: 'TICKET_RESOLVED',
  TICKET_REOPENED: 'TICKET_REOPENED',
  TICKET_CLOSED: 'TICKET_CLOSED',
};

export const HISTORY_ACTIONS = {
  CREATED: 'CREATED',
  ASSIGNED: 'ASSIGNED',
  REASSIGNED: 'REASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  ATTACHMENT_ADDED: 'ATTACHMENT_ADDED',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACHED: 'SLA_BREACHED',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
};

export const DEFAULT_SLA_RULES = [
  {
    priority: TICKET_PRIORITY.CRITICAL,
    responseDeadlineMinutes: 15,
    resolutionDeadlineMinutes: 120, // 2 hours
    warningThresholdPercent: 80,
    description: 'System-wide outage or catastrophic security/data integrity failure',
  },
  {
    priority: TICKET_PRIORITY.HIGH,
    responseDeadlineMinutes: 30,
    resolutionDeadlineMinutes: 240, // 4 hours
    warningThresholdPercent: 80,
    description: 'Major business process blocked with no immediate workaround',
  },
  {
    priority: TICKET_PRIORITY.MEDIUM,
    responseDeadlineMinutes: 120, // 2 hours
    resolutionDeadlineMinutes: 720, // 12 hours
    warningThresholdPercent: 80,
    description: 'Normal business disruption or non-critical issue with workaround',
  },
  {
    priority: TICKET_PRIORITY.LOW,
    responseDeadlineMinutes: 240, // 4 hours
    resolutionDeadlineMinutes: 1440, // 24 hours
    warningThresholdPercent: 80,
    description: 'General inquiry, minor feature request, or administrative task',
  },
];
