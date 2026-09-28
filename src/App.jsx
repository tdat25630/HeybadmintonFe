import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import SessionsPage from './pages/SessionsPage';
import MembersPage from './pages/MembersPage';
import ProfilePage from './pages/ProfilePage';
import RolesPage from './pages/RolesPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="page-shell loading-shell">Đang tải...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="page-shell loading-shell">Đang tải...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Outlet />
                        </AppLayout>
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="permissions" element={<RolesPage />} />
                <Route path="settings/access-control" element={<RolesPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
