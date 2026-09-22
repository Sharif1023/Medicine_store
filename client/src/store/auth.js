import axios from 'axios';
import { create } from 'zustand';

const apiBase = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
const storedUser = () => { try { return JSON.parse(localStorage.getItem('sc_user') || 'null') } catch { return null } };

export const useAuthStore = create((set, get) => ({
    user: storedUser(),
    accessToken: null,
    hydrated: false,
    setSession: s => { localStorage.setItem('sc_user', JSON.stringify(s.user)); set({ user: s.user, accessToken: s.accessToken, hydrated: true }) },
    initialize: async () => {
        if (get().hydrated) return;
        try {
            const { data } = await axios.post(apiBase + '/auth/refresh', {}, { withCredentials: true });
            get().setSession(data.data);
        } catch {
            localStorage.removeItem('sc_user');
            set({ user: null, accessToken: null, hydrated: true });
        }
    },
    logoutLocal: () => { localStorage.removeItem('sc_user'); set({ user: null, accessToken: null, hydrated: true }) }
}));