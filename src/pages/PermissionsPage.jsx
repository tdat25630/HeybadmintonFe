import { useEffect, useState } from 'react';
import { permissionApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';

const emptyForm = { name: '', description: '' };

export default function PermissionsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await permissionApi.getPermissions();
            setItems(response || []);
        } catch (err) {
            setError(err?.message || 'Không thể tải quyền.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const submit = async () => {
        if (!form.name.trim()) {
            setError('Tên quyền là bắt buộc.');
            return;
        }

        setSaving(true);
        try {
            await permissionApi.createPermission({ name: form.name.trim(), description: form.description.trim() });
            setForm(emptyForm);
            setModalOpen(false);
            await fetchPermissions();
        } catch (err) {
            setError(err?.message || 'Không thể tạo quyền.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!confirmDelete) return;
        try {
            await permissionApi.deletePermission(confirmDelete);
            setConfirmDelete(null);
            await fetchPermissions();
        } catch (err) {
            setError(err?.message || 'Không thể xóa quyền.');
            setConfirmDelete(null);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Quyền</h1>
                <p>Quản lý các quyền truy cập của hệ thống.</p>
            </div>

            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Danh sách quyền</h3>
                    <button type="button" className="primary-button" onClick={() => setModalOpen(true)}>+ Tạo quyền</button>
                </div>

                {error ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{error}</div> : null}

                {loading ? <div className="empty-state" style={{ minHeight: '160px' }}>Đang tải quyền...</div> : null}

                {!loading && !items.length ? <div className="empty-state" style={{ minHeight: '160px' }}>Chưa có quyền nào.</div> : null}

                {!loading && items.length ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {items.map((item) => (
                            <div key={item.name} className="card" style={{ padding: '0.8rem 1rem', background: 'rgba(17,27,39,0.7)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <div style={{ color: '#9fb2c9', fontSize: '0.82rem' }}>{item.description || 'Không có mô tả'}</div>
                                    </div>
                                    <button type="button" className="danger-button" onClick={() => setConfirmDelete(item.name)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <Modal open={modalOpen} title="Tạo quyền" onClose={() => setModalOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={submit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                </>
            )}>
                <div className="field">
                    <label>Tên quyền</label>
                    <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="field mt-2">
                    <label>Mô tả</label>
                    <input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
            </Modal>

            <ConfirmDialog open={Boolean(confirmDelete)} title="Xác nhận xóa quyền" message="Bạn có chắc chắn muốn xóa quyền này?" onConfirm={remove} onCancel={() => setConfirmDelete(null)} />
        </div>
    );
}
