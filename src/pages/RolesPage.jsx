import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { permissionApi, roleApi } from '../api';

const defaultRoleForm = { name: '', description: '', permissions: [] };
const defaultPermissionForm = { name: '', description: '' };

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleForm, setRoleForm] = useState(defaultRoleForm);
    const [permissionForm, setPermissionForm] = useState(defaultPermissionForm);
    const [modalOpen, setModalOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [savingRole, setSavingRole] = useState(false);
    const [savingPermission, setSavingPermission] = useState(false);
    const [confirmRole, setConfirmRole] = useState(null);
    const [confirmPermission, setConfirmPermission] = useState(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [roleResponse, permissionResponse] = await Promise.all([
                roleApi.getRoles(),
                permissionApi.getPermissions(),
            ]);

            setRoles(roleResponse || []);
            setPermissions(permissionResponse || []);
        } catch (err) {
            setError(err?.message || 'Không thể tải vai trò và quyền.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCreateRole = async () => {
        if (!roleForm.name.trim()) {
            setError('Tên vai trò là bắt buộc.');
            return;
        }

        setSavingRole(true);
        try {
            await roleApi.createRole({
                name: roleForm.name.trim(),
                description: roleForm.description,
                permissions: roleForm.permissions,
            });
            setRoleForm(defaultRoleForm);
            setModalOpen(false);
            await fetchAll();
        } catch (err) {
            setError(err?.message || 'Không thể tạo vai trò.');
        } finally {
            setSavingRole(false);
        }
    };

    const handleCreatePermission = async () => {
        if (!permissionForm.name.trim()) {
            setError('Tên quyền là bắt buộc.');
            return;
        }

        setSavingPermission(true);
        try {
            await permissionApi.createPermission({
                name: permissionForm.name.trim(),
                description: permissionForm.description,
            });
            setPermissionForm(defaultPermissionForm);
            setPermissionOpen(false);
            await fetchAll();
        } catch (err) {
            setError(err?.message || 'Không thể tạo quyền.');
        } finally {
            setSavingPermission(false);
        }
    };

    const deleteRole = async () => {
        if (!confirmRole) return;
        try {
            await roleApi.deleteRole(confirmRole);
            setConfirmRole(null);
            await fetchAll();
        } catch (err) {
            setError(err?.message || 'Không thể xóa vai trò.');
            setConfirmRole(null);
        }
    };

    const deletePermission = async () => {
        if (!confirmPermission) return;
        try {
            await permissionApi.deletePermission(confirmPermission);
            setConfirmPermission(null);
            await fetchAll();
        } catch (err) {
            setError(err?.message || 'Không thể xóa quyền.');
            setConfirmPermission(null);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Vai trò &amp; quyền</h1>
                <p>Quản lý phân quyền của hệ thống câu lạc bộ.</p>
            </div>

            {error ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{error}</div> : null}

            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Vai trò</h3>
                    <button type="button" className="primary-button" onClick={() => setModalOpen(true)}>+ Tạo vai trò</button>
                </div>

                {loading ? <div className="empty-state" style={{ minHeight: '120px' }}>Đang tải vai trò...</div> : null}

                {!loading && roles.length ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {roles.map((role) => (
                            <div key={role.name} className="card" style={{ padding: '0.8rem 1rem', background: 'rgba(17,27,39,0.7)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <strong>{role.name}</strong>
                                        <div style={{ color: '#9fb2c9', fontSize: '0.82rem' }}>{role.description || 'Không có mô tả'}</div>
                                    </div>
                                    <button type="button" className="danger-button" onClick={() => setConfirmRole(role.name)}>Xóa</button>
                                </div>
                                <div style={{ marginTop: '0.8rem', color: '#b6c9dc', fontSize: '0.82rem' }}>
                                    {role.permissions?.length ? role.permissions.map((permission) => permission.name || permission).join(', ') : 'Chưa có quyền'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Quyền</h3>
                    <button type="button" className="primary-button" onClick={() => setPermissionOpen(true)}>+ Tạo quyền</button>
                </div>

                {!loading && permissions.length ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {permissions.map((permission) => (
                            <div key={permission.name} className="card" style={{ padding: '0.8rem 1rem', background: 'rgba(17,27,39,0.7)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <strong>{permission.name}</strong>
                                        <div style={{ color: '#9fb2c9', fontSize: '0.82rem' }}>{permission.description || 'Không có mô tả'}</div>
                                    </div>
                                    <button type="button" className="danger-button" onClick={() => setConfirmPermission(permission.name)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <Modal open={modalOpen} title="Tạo vai trò" onClose={() => setModalOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={handleCreateRole} disabled={savingRole}>{savingRole ? 'Đang lưu...' : 'Lưu'}</button>
                </>
            )}>
                <div className="field">
                    <label>Tên vai trò</label>
                    <input value={roleForm.name} onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="field mt-2">
                    <label>Mô tả</label>
                    <input value={roleForm.description} onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="field mt-2">
                    <label>Quyền</label>
                    <select multiple value={roleForm.permissions} onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                        setRoleForm((prev) => ({ ...prev, permissions: selected }));
                    }} style={{ minHeight: '120px' }}>
                        {permissions.map((permission) => (
                            <option key={permission.name} value={permission.name}>{permission.name}</option>
                        ))}
                    </select>
                </div>
            </Modal>

            <Modal open={permissionOpen} title="Tạo quyền" onClose={() => setPermissionOpen(false)} footer={(
                <>
                    <button type="button" className="secondary-button" onClick={() => setPermissionOpen(false)}>Hủy</button>
                    <button type="button" className="primary-button" onClick={handleCreatePermission} disabled={savingPermission}>{savingPermission ? 'Đang lưu...' : 'Lưu'}</button>
                </>
            )}>
                <div className="field">
                    <label>Tên quyền</label>
                    <input value={permissionForm.name} onChange={(e) => setPermissionForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="field mt-2">
                    <label>Mô tả</label>
                    <input value={permissionForm.description} onChange={(e) => setPermissionForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
            </Modal>

            <ConfirmDialog open={Boolean(confirmRole)} title="Xác nhận xóa vai trò" message="Bạn có chắc chắn muốn xóa vai trò này?" onConfirm={deleteRole} onCancel={() => setConfirmRole(null)} />
            <ConfirmDialog open={Boolean(confirmPermission)} title="Xác nhận xóa quyền" message="Bạn có chắc chắn muốn xóa quyền này?" onConfirm={deletePermission} onCancel={() => setConfirmPermission(null)} />
        </div>
    );
}
