import axios from 'axios';

const TOKEN_STORAGE_KEY = 'watchgate_token';
const USER_ID_STORAGE_KEY = 'watchgate_user_id';

/**
 * Shared Axios instance for the Watchgate Locksight backend (api/v1).
 * Attaches the JWT obtained at sign-in/sign-up to every outgoing request.
 */
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function setAuthToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Persists the signed-in user's id so the session can be rehydrated
 * (e.g. on page refresh) without re-authenticating.
 * @param {number|string|null} userId
 */
export function setUserId(userId) {
    if (userId !== null && userId !== undefined) {
        localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
    } else {
        localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
}

export function getUserId() {
    return localStorage.getItem(USER_ID_STORAGE_KEY);
}

/**
 * Clears all persisted session data (token + user id).
 */
export function clearSession() {
    setAuthToken(null);
    setUserId(null);
}
