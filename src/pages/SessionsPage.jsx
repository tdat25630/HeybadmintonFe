import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { participantApi, sessionApi, userApi } from '../api';
import { isAdminUser, useAuth } from '../context/AuthContext';

const defaultMemberForm = { userId: '', sessionId: '', guestName: '', guestGender: true, guestLevel: '' };
const defaultGuestForm = { sessionId: '', guestName: '', guestGender: true, guestLevel: '' };

export default function SessionsPage() {
    const { user } = useAuth();
    const isAdmin = isAdminUser(user);
    const [sessions, setSessions] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessionForm, setSessionForm] = useState({ description: '' });
    const [sessionError, setSessionError] = useState('');
    const [sessionSuccess, setSessionSuccess] = useState('');
    const [creatingSession, setCreatingSession] = useState(false);
    const [memberOpen, setMemberOpen] = useState(false);
    const [guestOpen, setGuestOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [memberForm, setMemberForm] = useState(defaultMemberForm);
    const [guestForm, setGuestForm] = useState(defaultGuestForm);
    const [memberLoading, setMemberLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const loadSessions = async (nextPage = page) => {
        try {
            setLoading(true);
            const response = await sessionApi.getSessions(nextPage, 10);
            setSessions(response?.items || []);
            setPage(response?.page ?? nextPage);
            setTotalPages(response?.totalPages ?? 1);
            setTotalElements(response?.totalElements ?? 0);
        } catch (err) {
            setError(err?.message || 'Không thể tải buổi sinh hoạt.');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async (keyword = '') => {
        try {
            const response = keyword
                ? await userApi.searchUsername(keyword, 0, 20)
                : await userApi.getUsers(0, 20);
            setUsers(response?.items || []);
        } catch {
            setUsers([]);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers(userSearch.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch]);

    const handleCreateSession = async (event) => {
        event.preventDefault();
        if (!sessionForm.description.trim()) {
            setSessionError('Mô tả buổi là bắt buộc.');
            return;
        }

        setCreatingSession(true);
        setSessionError('');
        setSessionSuccess('');

        try {
            await sessionApi.createSession(sessionForm.description.trim());
            setSessionSuccess('Tạo buổi thành công.');
            setSessionForm({ description: '' });
            await loadSessions(0);
        } catch (err) {
            setSessionError(err?.message || 'Không thể tạo buổi mới.');
        } finally {
            setCreatingSession(false);
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();
        if (!memberForm.sessionId || !memberForm.userId) {
            setSessionError('Vui lòng chọn buổi và thành viên.');
            return;
        }

        setMemberLoading(true);
        try {
            await participantApi.addMember({
                sessionId: memberForm.sessionId,
                userId: memberForm.userId,
                guestName: '',
                guestGender: true,
                guestLevel: '',
            });
            setMemberOpen(false);
            setMemberForm(defaultMemberForm);
            setSessionSuccess('Đã thêm thành viên vào buổi.');
            await loadSessions(page);
        } catch (err) {
            setSessionError(err?.message || 'Không thể thêm thành viên.');
        } finally {
            setMemberLoading(false);
        }
    };

    const handleAddGuest = async (event) => {
        event.preventDefault();
        if (!guestForm.sessionId || !guestForm.guestName.trim()) {
            setSessionError('Vui lòng chọn buổi và tên khách.');
            return;
        }

        setGuestLoading(true);
        try {
            await participantApi.addGuest({
                sessionId: guestForm.sessionId,
                guestName: guestForm.guestName.trim(),
                guestGender: guestForm.guestGender,
                guestLevel: guestForm.guestLevel || '',
            });
            setGuestOpen(false);
            setGuestForm(defaultGuestForm);
            setSessionSuccess('Đã thêm vãng lai thành công.');
            await loadSessions(page);
        } catch (err) {
            setSessionError(err?.message || 'Không thể thêm vãng lai.');
        } finally {
            setGuestLoading(false);
        }
    };

    const sessionOptions = useMemo(() => sessions, [sessions]);

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Buổi sinh hoạt</h1>
                <p>Quản lý lịch tập và điểm danh thành viên.</p>
            </div>

            {isAdmin ? (
                <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                    <form onSubmit={handleCreateSession}>
                        <div className="field">
                            <label htmlFor="description">Mô tả buổi</label>
                            <input id="description" value={sessionForm.description} onChange={(e) => setSessionForm({ description: e.target.value })} placeholder="Ví dụ: Sinh hoạt CLB" />
                        </div>

                        {sessionError ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{sessionError}</div> : null}
                        {sessionSuccess ? <div className="info-banner mt-2">{sessionSuccess}</div> : null}

                        <div className="form-actions">
                            <button type="button" className="secondary-button" onClick={() => { setSessionForm({ description: '' }); setSessionError(''); setSessionSuccess(''); }}>Hủy</button>
                            <button type="submit" className="primary-button" disabled={creatingSession}>{creatingSession ? 'Đang tạo...' : 'Tạo buổi'}</button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="card" style={{ marginTop: '1.25rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>Danh sách buổi</h3>
                    {isAdmin ? (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button type="button" className="primary-button" onClick={() => setMemberOpen(true)}>+ Thêm thành viên</button>
                            <button type="button" className="secondary-button" onClick={() => setGuestOpen(true)}>+ Thêm vãng lai</button>
                        </div>
                    ) : null}
                </div>

                {loading ? <div className="empty-state" style={{ minHeight: '160px' }}>Đang tải buổi sinh hoạt...</div> : null}
                {!loading && !sessions.length ? <div className="empty-state" style={{ minHeight: '160px' }}>Chưa có buổi sinh hoạt nào.</div> : null}

                {!loading && sessions.length ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sessions.map((session) => (
                            <div key={session.sessionId} className="session-card">
                                <div className="session-header">
                                    <div>
                                        <h4 className="session-title">{session.description || 'Buổi mới'}</h4>
                                        <div className="session-meta">
                                            <span>{session.sessionId}</span>
                                        </div>
                                    </div>
                                    <span className="badge success">Đã tạo</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} pageSize={10} onPageChange={(newPage) => loadSessions(newPage)} disabled={loading} />

            <Modal open={memberOpen} title="Thêm thành viên" onClose={() => setMemberOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setMemberOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={handleAddMember} disabled={memberLoading}>{memberLoading ? 'Đang lưu...' : 'Thêm'}</button>
                </>
            )}>
                <div className="field">
                    <label htmlFor="sessionMember">Buổi</label>
                    <select id="sessionMember" value={memberForm.sessionId} onChange={(e) => setMemberForm((prev) => ({ ...prev, sessionId: e.target.value }))}>
                        <option value="">Chọn buổi</option>
                        {sessionOptions.map((session) => (
                            <option key={session.sessionId} value={session.sessionId}>{session.description || session.sessionId}</option>
                        ))}
                    </select>
                </div>

                <div className="field mt-2">
                    <label htmlFor="memberSearch">Tìm thành viên</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#9fb2c9' }} />
                        <input id="memberSearch" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Tìm tên người dùng" style={{ paddingLeft: '2.3rem' }} />
                    </div>
                </div>

                <div className="field mt-2">
                    <label htmlFor="memberUser">Thành viên</label>
                    <select id="memberUser" value={memberForm.userId} onChange={(e) => setMemberForm((prev) => ({ ...prev, userId: e.target.value }))}>
                        <option value="">Chọn thành viên</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.username} - {user.firstName} {user.lastName}</option>
                        ))}
                    </select>
                </div>
            </Modal>

            <Modal open={guestOpen} title="Thêm vãng lai" onClose={() => setGuestOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setGuestOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={handleAddGuest} disabled={guestLoading}>{guestLoading ? 'Đang lưu...' : 'Thêm'}</button>
                </>
            )}>
                <div className="field">
                    <label htmlFor="guestSession">Buổi</label>
                    <select id="guestSession" value={guestForm.sessionId} onChange={(e) => setGuestForm((prev) => ({ ...prev, sessionId: e.target.value }))}>
                        <option value="">Chọn buổi</option>
                        {sessionOptions.map((session) => (
                            <option key={session.sessionId} value={session.sessionId}>{session.description || session.sessionId}</option>
                        ))}
                    </select>
                </div>

                <div className="field mt-2">
                    <label htmlFor="guestName">Tên khách</label>
                    <input id="guestName" value={guestForm.guestName} onChange={(e) => setGuestForm((prev) => ({ ...prev, guestName: e.target.value }))} placeholder="Ví dụ: Khách A" />
                </div>

                <div className="grid-2 mt-2">
                    <div className="field">
                        <label htmlFor="guestGender">Giới tính</label>
                        <select id="guestGender" value={String(guestForm.guestGender)} onChange={(e) => setGuestForm((prev) => ({ ...prev, guestGender: e.target.value === 'true' }))}>
                            <option value="true">Nam</option>
                            <option value="false">Nữ</option>
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="guestLevel">Trình độ</label>
                        <input id="guestLevel" value={guestForm.guestLevel} onChange={(e) => setGuestForm((prev) => ({ ...prev, guestLevel: e.target.value }))} placeholder="Tùy chọn" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
