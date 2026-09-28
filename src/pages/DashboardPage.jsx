import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionApi, userApi } from '../api';

export default function DashboardPage() {
    const [sessions, setSessions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [sessionResponse, userResponse] = await Promise.all([
                    sessionApi.getSessions(0, 5),
                    userApi.getUsers(0, 5),
                ]);

                setSessions(sessionResponse?.items || []);
                setMembers(userResponse?.items || []);
            } catch (err) {
                setError(err?.message || 'Không thể tải dữ liệu tổng quan.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <div className="page-shell"><div className="empty-state">Đang tải tổng quan...</div></div>;
    }

    if (error) {
        return <div className="page-shell"><div className="error-state">{error}</div></div>;
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Tổng quan</h1>
                <p>Thông tin nhanh về hoạt động của câu lạc bộ.</p>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: '#9fb2c9' }}>Buổi sinh hoạt</div>
                    <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem' }}>{sessions.length}</h2>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ color: '#9fb2c9' }}>Thành viên</div>
                    <h2 style={{ margin: '0.4rem 0 0', fontSize: '2rem' }}>{members.length}</h2>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: '1rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <h3>Buổi gần đây</h3>
                    {sessions.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            {sessions.map((session) => (
                                <div key={session.sessionId} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
                                    <strong>{session.description || 'Buổi mới'}</strong>
                                    <div style={{ color: '#9fb2c9', fontSize: '0.85rem' }}>{session.sessionId}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ minHeight: '90px' }}>Chưa có buổi nào.</div>
                    )}
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <h3>Thành viên mới</h3>
                    {members.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            {members.map((member) => (
                                <div key={member.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
                                    <strong>{member.firstName} {member.lastName}</strong>
                                    <div style={{ color: '#9fb2c9', fontSize: '0.85rem' }}>{member.username}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ minHeight: '90px' }}>Chưa có thành viên.</div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
                <h3>Thao tác nhanh</h3>
                <div className="action-group">
                    <Link to="/attendance" className="primary-button">Điểm danh</Link>
                    <Link to="/sessions" className="secondary-button">Tạo buổi</Link>
                    <Link to="/members" className="secondary-button">Thêm thành viên</Link>
                </div>
            </div>
        </div>
    );
}
