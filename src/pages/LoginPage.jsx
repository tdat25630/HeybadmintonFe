import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setSubmitError('');
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.username.trim()) nextErrors.username = 'Tên đăng nhập là bắt buộc.';
        if (!form.password) nextErrors.password = 'Mật khẩu là bắt buộc.';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setSubmitError('');

        try {
            await login(form.username.trim(), form.password);
        } catch (error) {
            setSubmitError(error?.message || 'Đăng nhập thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="card login-card">
                <div className="brand" style={{ marginBottom: '1rem' }}>
                    <div className="brand-mark">HB</div>
                    <div className="brand-text">
                        <span className="brand-name">HeyBadminton</span>
                        <span className="brand-subtitle">CLB Cầu lông HeyBadminton</span>
                    </div>
                </div>

                <h1>Đăng nhập</h1>
                <p>Quản lý buổi tập, thành viên và điểm danh.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input id="username" value={form.username} onChange={handleChange('username')} autoComplete="username" />
                        {errors.username ? <span className="error-text">{errors.username}</span> : <span className="error-text" />}
                    </div>

                    <div className="field mt-2">
                        <label htmlFor="password">Mật khẩu</label>
                        <input id="password" type="password" value={form.password} onChange={handleChange('password')} autoComplete="current-password" />
                        {errors.password ? <span className="error-text">{errors.password}</span> : <span className="error-text" />}
                    </div>

                    {submitError ? <div className="error-state mt-2" style={{ minHeight: '3rem', padding: '0.75rem' }}>{submitError}</div> : null}

                    <button type="submit" className="primary-button mt-2" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}
