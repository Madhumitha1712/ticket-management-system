import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Gates
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRedirect from './RoleRedirect.jsx';

// Auth Pages
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard.jsx';
import MyTickets from '../pages/employee/MyTickets.jsx';
import CreateTicket from '../pages/employee/CreateTicket.jsx';
import EmployeeTicketDetail from '../pages/employee/EmployeeTicketDetail.jsx';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard.jsx';
import AssignedTickets from '../pages/agent/AssignedTickets.jsx';
import AgentTicketDetail from '../pages/agent/AgentTicketDetail.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AllTickets from '../pages/admin/AllTickets.jsx';
import EscalationsView from '../pages/admin/EscalationsView.jsx';
import UserManagement from '../pages/admin/UserManagement.jsx';
import CategoryManagement from '../pages/admin/CategoryManagement.jsx';
import SLAManagement from '../pages/admin/SLAManagement.jsx';
import AgentLeaderboard from '../pages/admin/AgentLeaderboard.jsx';

// Shared Pages
import LandingPage from '../pages/LandingPage.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';
import NotFound from '../pages/NotFound.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Role-based redirect helper */}
      <Route path="/app" element={<RoleRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/tickets" element={<MyTickets />} />
          <Route path="/employee/tickets/new" element={<CreateTicket />} />
          <Route path="/employee/tickets/:id" element={<EmployeeTicketDetail />} />
          <Route path="/employee/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Protected Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['AGENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/tickets" element={<AssignedTickets />} />
          <Route path="/agent/tickets/:id" element={<AgentTicketDetail />} />
          <Route path="/agent/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<AllTickets />} />
          <Route path="/admin/tickets/:id" element={<AgentTicketDetail />} />
          <Route path="/admin/escalations" element={<EscalationsView />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/sla" element={<SLAManagement />} />
          <Route path="/admin/leaderboard" element={<AgentLeaderboard />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
