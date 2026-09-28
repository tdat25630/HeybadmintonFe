import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('hb_token') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            const currentToken = localStorage.getItem('hb_token');
            if (!currentToken) {
                setLoading(false);
                return;
            }

            try {
                const userInfo = await userApi.getMyInfo();
                setUser(userInfo);
            } catch {
                localStorage.removeItem('hb_token');
                localStorage.removeItem('hb_user');
                setToken('');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('hb_token', token);
        } else {
            localStorage.removeItem('hb_token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('hb_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('hb_user');
        }
    }, [user]);

    const login = async (username, password) => {
        const data = await authApi.login(username, password);
        const signedToken = data?.token;

        if (!signedToken) {
            throw new Error('Đăng nhập không thành công.');
        }

        setToken(signedToken);

        const myInfo = await userApi.getMyInfo();
        setUser(myInfo);
        return myInfo;
    };

    const logout = async () => {
        const currentToken = token || localStorage.getItem('hb_token');

        try {
            if (currentToken) {
                await authApi.logout(currentToken);
            }
        } catch {
            // ignore backend logout issues on client-side cleanup
        } finally {
            setUser(null);
            setToken('');
            localStorage.removeItem('hb_token');
            localStorage.removeItem('hb_user');
        }
    };

    const refreshUser = async () => {
        try {
            const response = await userApi.getMyInfo();
            setUser(response);
            return response;
        } catch (error) {
            console.error('Unable to refresh user', error);
            return null;
        }
    };

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: Boolean(token && user),
            setUser,
            setToken,
            login,
            logout,
            refreshUser,
        }),
        [user, token, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
