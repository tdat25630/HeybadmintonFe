import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import ConfirmDialog from '../components/ConfirmDialog';
import { userApi } from '../api';

const emptyForm = { username: '', password: '', firstName: '', lastName: '', dob: '' };

export default function MembersPage() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetId, setTargetId] = useState(null);

    const loadUsers = async (query = search, currentPage = page) => {
        try {
            setLoading(true);
            const response = query.trim()
                ? await userApi.searchUsername(query.trim(), currentPage, size)
                : await userApi.getUsers(currentPage, size);

            const items = response?.items || [];
            setUsers(items);
            setPage(response?.page ?? currentPage);
            setTotalPages(response?.totalPages ?? 1);
            setTotalElements(response?.totalElements ?? 0);
        } catch (err) {
            setError(err?.message || 'Không thể tải danh sách thành viên.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers(search, 0);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const validate = () => {
        if (!form.username || form.username.length < 5 || /\s/.test(form.username)) {
            setFormError('Tên đăng nhập phải tối thiểu 5 ký tự và không chứa khoảng trắng.');
            return false;
        }

        if (!editing && (!form.password || form.password.length < 8)) {
            setFormError('Mật khẩu phải có ít nhất 8 ký tự.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setSaving(true);
        setFormError('');

        try {
            const payload = {
                username: form.username,
                password: form.password || undefined,
                firstName: form.firstName,
                lastName: form.lastName,
                dob: form.dob,
            };

            if (editing) {
                await userApi.updateUser(editing.id, payload);
            } else {
                await userApi.createUser(payload);
            }

            setModalOpen(false);
            setEditing(null);
            setForm(emptyForm);
            await loadUsers(search, 0);
        } catch (err) {
            setFormError(err?.message || 'Không thể lưu thành viên.');
        } finally {
            setSaving(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (member) => {
        setEditing(member);
        setForm({
            username: member.username || '',
            password: '',
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            dob: member.dob || '',
        });
        setFormError('');
        setModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!targetId) return;

        try {
            await userApi.deleteUser(targetId);
            setConfirmOpen(false);
            setTargetId(null);
            await loadUsers(search, 0);
        } catch (err) {
            setError(err?.message || 'Không thể xóa thành viên.');
            setConfirmOpen(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Thành viên</h1>
                <p>Quản lý thông tin người tập và tài khoản thành viên.</p>
            </div>

            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm kiếm tên đăng nhập..." />
                    <button type="button" className="primary-button" onClick={openCreate}>+ Thêm thành viên</button>
                </div>

                {error ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{error}</div> : null}

                <div className="table-wrap" style={{ marginTop: '1rem' }}>
                    {loading ? <div className="empty-state" style={{ minHeight: '180px' }}>Đang tải thành viên...</div> : null}

                    {!loading && !users.length ? <div className="empty-state" style={{ minHeight: '180px' }}>Không tìm thấy thành viên nào.</div> : null}

                    {!loading && users.length ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Họ tên</th>
                                    <th>Ngày sinh</th>
                                    <th>Vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.username}</td>
                                        <td>{member.firstName} {member.lastName}</td>
                                        <td>{member.dob || '—'}</td>
                                        <td>{member.roles?.map((role) => role.name).join(', ') || 'Thành viên'}</td>
                                        <td>
                                            <div className="action-group">
                                                <button type="button" className="secondary-button" onClick={() => openEdit(member)}>Sửa</button>
                                                <button type="button" className="danger-button" onClick={() => { setTargetId(member.id); setConfirmOpen(true); }}>Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} pageSize={size} onPageChange={(newPage) => loadUsers(search, newPage)} disabled={loading} />
            </div>

            <Modal open={modalOpen} title={editing ? 'Cập nhật thành viên' : 'Thêm thành viên'} onClose={() => setModalOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={handleSubmit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                </>
            )}>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                    </div>
                    {!editing ? (
                        <div className="field">
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                    ) : null}
                    <div className="field">
                        <label htmlFor="firstName">Họ</label>
                        <input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div className="field">
                        <label htmlFor="lastName">Tên</label>
                        <input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="dob">Ngày sinh</label>
                        <input id="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                    </div>
                </div>

                {formError ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{formError}</div> : null}
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                title="Xác nhận xóa"
                message="Bạn có chắc muốn xóa thành viên này?"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
            />
        </div>
    );
}
