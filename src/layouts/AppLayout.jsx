import { LogOut, LayoutDashboard, CalendarDays, Users, ShieldCheck, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/attendance', label: 'Điểm danh', icon: CalendarDays },
    { to: '/sessions', label: 'Buổi sinh hoạt', icon: CalendarDays },
    { to: '/members', label: 'Thành viên', icon: Users },
    { to: '/roles', label: 'Vai trò', icon: ShieldCheck },
    { to: '/profile', label: 'Hồ sơ', icon: UserCircle2 },
];

export default function AppLayout() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark">Z1</div>
                    <div className="brand-text">
                        <span className="brand-name">CLB Cầu lông Z1</span>
                        <span className="brand-subtitle">Quản lý quỹ &amp; hoạt động CLB</span>
                    </div>
                </div>

                <div className="topbar-actions">
                    <button type="button" className="secondary-button add-btn">
                        Điểm danh
                    </button>

                    <div className="inline-user">
                        <div className="avatar">{user?.firstName?.[0]?.toUpperCase() || 'U'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }} className="meta">
                            <strong>{user?.firstName || 'Người dùng'} {user?.lastName || ''}</strong>
                            <span style={{ color: '#9fb2c9', fontSize: '0.75rem' }}>{user?.roles?.[0]?.name || 'Thành viên'}</span>
                        </div>
                    </div>

                    <button type="button" className="icon-button" onClick={handleLogout} aria-label="Đăng xuất">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="layout">
                <aside className="sidebar">
                    <nav className="nav-list" aria-label="Sidebar navigation">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink key={to} to={to} end={to === '/dashboard'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Icon size={18} />
                                <span className="nav-text">{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <main className="main-panel">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
