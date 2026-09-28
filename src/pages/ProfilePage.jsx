import { useEffect, useState } from 'react';
import { userApi } from '../api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { firstName: '', lastName: '', dob: '', password: '' };

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await userApi.getMyInfo();
                setProfile({
                    firstName: result?.firstName || '',
                    lastName: result?.lastName || '',
                    dob: result?.dob || '',
                    password: '',
                });
            } catch (err) {
                setError(err?.message || 'Không thể tải hồ sơ.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        setError('');

        try {
            await userApi.updateUser(user.id, {
                password: profile.password || undefined,
                firstName: profile.firstName,
                lastName: profile.lastName,
                dob: profile.dob,
                roles: user.roles?.map((r) => r.name) || [],
            });
            await refreshUser();
            setProfile((prev) => ({ ...prev, password: '' }));
        } catch (err) {
            setError(err?.message || 'Không thể cập nhật hồ sơ.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="page-shell"><div className="empty-state">Đang tải hồ sơ...</div></div>;
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <h1>Hồ sơ</h1>
                <p>Thông tin tài khoản và cập nhật dữ liệu cá nhân.</p>
            </div>

            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                {error ? <div className="error-state" style={{ minHeight: '3rem', padding: '0.75rem' }}>{error}</div> : null}

                <div className="form-grid">
                    <div className="field">
                        <label>Username</label>
                        <input value={user?.username || ''} readOnly />
                    </div>
                    <div className="field">
                        <label>Vai trò</label>
                        <input value={user?.roles?.map((r) => r.name).join(', ') || 'Thành viên'} readOnly />
                    </div>
                    <div className="field">
                        <label>Họ</label>
                        <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                    </div>
                    <div className="field">
                        <label>Tên</label>
                        <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label>Ngày sinh</label>
                        <input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label>Mật khẩu mới</label>
                        <input type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="Để trống nếu không đổi" />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
                </div>
            </div>
        </div>
    );
}
