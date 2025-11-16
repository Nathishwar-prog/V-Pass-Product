import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';

import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff';
import Reports from './pages/admin/Reports';

import SecurityDashboard from './pages/security/SecurityDashboard';
import IssuePass from './pages/security/IssuePass';
import VisitorLog from './pages/security/VisitorLog';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import InviteVisitor from './pages/employee/InviteVisitor';
import MyVisitors from './pages/employee/MyVisitors';

import ViewPass from './pages/visitor/ViewPass';
import PreRegistration from './pages/visitor/PreRegistration';


const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    const getHomeRoute = () => {
        if (!user) return '/login';
        switch (user.role) {
            case UserRole.ADMIN: return '/admin/dashboard';
            case UserRole.SECURITY: return '/security/dashboard';
            case UserRole.EMPLOYEE: return '/employee/dashboard';
            default: return '/login';
        }
    };
    
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/preregister" element={<PreRegistration />} />
            <Route path="/pass/:passId" element={<ViewPass />} />
            
            <Route path="/" element={user ? <Layout><Navigate to={getHomeRoute()} /></Layout> : <Navigate to="/login" />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Layout><Navigate to="/admin/dashboard" /></Layout></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
            <Route path="/admin/manage-staff" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Layout><ManageStaff /></Layout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Layout><Reports /></Layout></ProtectedRoute>} />
            
            {/* Security Routes */}
            <Route path="/security" element={<ProtectedRoute allowedRoles={[UserRole.SECURITY]}><Layout><Navigate to="/security/dashboard" /></Layout></ProtectedRoute>} />
            <Route path="/security/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.SECURITY]}><Layout><SecurityDashboard /></Layout></ProtectedRoute>} />
            <Route path="/security/issue-pass" element={<ProtectedRoute allowedRoles={[UserRole.SECURITY]}><Layout><IssuePass /></Layout></ProtectedRoute>} />
            <Route path="/security/visitor-log" element={<ProtectedRoute allowedRoles={[UserRole.SECURITY]}><Layout><VisitorLog /></Layout></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="/employee" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}><Layout><Navigate to="/employee/dashboard" /></Layout></ProtectedRoute>} />
            <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
            <Route path="/employee/invite-visitor" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}><Layout><InviteVisitor /></Layout></ProtectedRoute>} />
            <Route path="/employee/my-visitors" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}><Layout><MyVisitors /></Layout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={getHomeRoute()} />} />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <ToastProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </ToastProvider>
    </AuthProvider>
  );
};

export default App;
