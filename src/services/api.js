/**
 * API Configuration
 * Axios 인스턴스 및 기본 설정
 * 
 * // TODO: DATABASE 연결 필요
 * 백엔드 서버 URL을 환경변수로 설정 필요
 */

import axios from 'axios';

// API 기본 설정
const api = axios.create({
    // TODO: DATABASE 연결 필요 - 실제 백엔드 URL로 변경
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request 인터셉터 - 토큰 자동 첨부
api.interceptors.request.use(
    (config) => {
        // TODO: DATABASE 연결 필요 - 실제 토큰 저장소에서 가져오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response 인터셉터 - 에러 핸들링
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 401 에러 시 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // TODO: DATABASE 연결 필요 - 토큰 갱신 로직
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    // const response = await api.post('/auth/refresh', { refreshToken });
                    // localStorage.setItem('accessToken', response.data.accessToken);
                    // return api(originalRequest);
                }
            } catch (refreshError) {
                // 갱신 실패 시 로그아웃 처리
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
