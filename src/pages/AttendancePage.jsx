import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, Users, MapPin } from 'lucide-react';
import { participantApi, sessionApi } from '../api';

const genderMap = {
    true: 'Nam',
    false: 'Nữ',
};

export default function AttendancePage() {
    const [sessions, setSessions] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [participantsBySession, setParticipantsBySession] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const response = await sessionApi.getSessions(0, 20);
                setSessions(response?.items || []);
            } catch (err) {
                setError(err?.message || 'Không thể tải danh sách buổi sinh hoạt.');
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    const loadParticipants = async (sessionId) => {
        try {
            const response = await participantApi.getParticipants(sessionId, 0, 100);
            const items = response?.items || [];
            setParticipantsBySession((prev) => ({ ...prev, [sessionId]: items }));
        } catch (err) {
            setParticipantsBySession((prev) => ({ ...prev, [sessionId]: [] }));
            console.error(err);
        }
    };

    const toggleSession = async (sessionId) => {
        const nextState = !expanded[sessionId];
        setExpanded((prev) => ({ ...prev, [sessionId]: nextState }));

        if (nextState && !participantsBySession[sessionId]) {
            await loadParticipants(sessionId);
        }
    };

    if (loading) {
        return <div className="page-shell"><div className="empty-state">Đang tải danh sách buổi học...</div></div>;
    }

    if (error) {
        return <div className="page-shell"><div className="error-state">{error}</div></div>;
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Điểm danh</h1>
                <p>Đăng ký tham gia buổi. Lần đầu nhập giới tính và trình độ.</p>
                <div className="accent-line" />
            </div>

            <div className="info-banner">
                Hiện hệ thống đang hiển thị danh sách buổi từ API. Nếu API bổ sung ngày/địa điểm, giao diện có thể mở rộng mà không cần đổi dữ liệu hiện có.
            </div>

            <div className="collapse-panel">
                {sessions.length ? (
                    sessions.map((session) => {
                        const items = participantsBySession[session.sessionId] || [];
                        const isExpanded = !!expanded[session.sessionId];

                        const grouped = {
                            male: items.filter((item) => item.guestGender === true || (!item.guestName && item.userId)),
                            female: items.filter((item) => item.guestGender === false),
                            guest: items.filter((item) => !!item.guestName),
                        };

                        return (
                            <div key={session.sessionId} className="session-card" style={{ marginBottom: '1rem' }}>
                                <div className="session-header">
                                    <div className="session-title-group">
                                        <h3 className="session-title">{session.description || 'Buổi sinh hoạt'}</h3>
                                        <div className="session-meta">
                                            <span><CalendarDays size={14} /> {session.sessionId.slice(0, 8)}</span>
                                            <span><MapPin size={14} /> Không có dữ liệu vị trí</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="badge success">Đã đóng</span>
                                        <button type="button" className="icon-button" onClick={() => toggleSession(session.sessionId)} aria-label="Mở rộng buổi">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded ? (
                                    <div className="session-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dfeaf9' }}>
                                                <Users size={18} />
                                                <strong>Danh sách người chơi</strong>
                                            </div>
                                            <span className="badge neutral">{items.length} người</span>
                                        </div>

                                        {items.length ? (
                                            <>
                                                <div className="participant-section">
                                                    <div className="participant-section-header">Nam</div>
                                                    <div className="participant-list">
                                                        {grouped.male.length ? grouped.male.map((people, idx) => (
                                                            <div key={`${people.userId || people.guestName || idx}`} className="participant-item">
                                                                <div className="participant-main">
                                                                    <span className="participant-name">{people.guestName || 'Thành viên'}</span>
                                                                    <span className="participant-meta">{people.guestLevel || 'Không có trình độ'}</span>
                                                                </div>
                                                                <span className="badge neutral">{people.userId ? 'Thành viên' : 'Khách'}</span>
                                                            </div>
                                                        )) : <div className="participant-meta">Không có người nam.</div>}
                                                    </div>
                                                </div>

                                                <div className="participant-section">
                                                    <div className="participant-section-header">Nữ</div>
                                                    <div className="participant-list">
                                                        {grouped.female.length ? grouped.female.map((people, idx) => (
                                                            <div key={`${people.userId || people.guestName || idx}`} className="participant-item">
                                                                <div className="participant-main">
                                                                    <span className="participant-name">{people.guestName || 'Thành viên'}</span>
                                                                    <span className="participant-meta">{people.guestLevel || 'Không có trình độ'}</span>
                                                                </div>
                                                                <span className="badge neutral">{people.userId ? 'Thành viên' : 'Khách'}</span>
                                                            </div>
                                                        )) : <div className="participant-meta">Không có người nữ.</div>}
                                                    </div>
                                                </div>

                                                {grouped.guest.length ? (
                                                    <div className="participant-section">
                                                        <div className="participant-section-header">Khách</div>
                                                        <div className="participant-list">
                                                            {grouped.guest.map((people, idx) => (
                                                                <div key={`${people.guestName || idx}`} className="participant-item">
                                                                    <div className="participant-main">
                                                                        <span className="participant-name">{people.guestName}</span>
                                                                        <span className="participant-meta">{people.guestLevel || 'Không có trình độ'} • {genderMap[people.guestGender] || 'Chưa xác định'}</span>
                                                                    </div>
                                                                    <span className="badge neutral">Vãng lai</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : (
                                            <div className="empty-state" style={{ minHeight: '90px' }}>Chưa có người tham gia.</div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">Chưa có buổi sinh hoạt nào.</div>
                )}
            </div>
        </div>
    );
}
