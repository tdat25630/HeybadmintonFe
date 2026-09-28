import { Link } from 'react-router-dom';

const adminCards = [
    { title: 'Buổi sinh hoạt', description: 'Quản lý lịch tập và danh sách tham gia', to: '/admin/sessions' },
    { title: 'Thành viên', description: 'Quản lý tài khoản và hồ sơ thành viên', to: '/admin/users' },
    { title: 'Vai trò', description: 'Quản lý vai trò và phân quyền', to: '/admin/roles' },
    { title: 'Quyền', description: 'Quản lý quyền hệ thống', to: '/admin/permissions' },
];

export default function AdminDashboardPage() {
    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Quản trị</h1>
                <p>Quản lý thành viên, buổi sinh hoạt và phân quyền CLB.</p>
                <div className="accent-line" />
            </div>

            <div className="card-grid" style={{ marginTop: '1.5rem' }}>
                {adminCards.map((card) => (
                    <Link key={card.to} to={card.to} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '1.1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                            <h3 style={{ margin: 0 }}>{card.title}</h3>
                            <span className="badge neutral">Mở</span>
                        </div>
                        <p style={{ margin: 0, color: '#9fb2c9', lineHeight: 1.6 }}>{card.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
