/**
 * 인증 서비스
 * 로그인, 회원가입, 로그아웃, 토큰 갱신 API
 * 
 * // TODO: DATABASE 연결 필요
 */

import api from './api';

const authService = {
    /**
     * 로그인
     * @param {string} identifier - 사용자 이메일 또는 전화번호
     * @param {string} password - 비밀번호
     * @returns {Promise} 로그인 결과 (토큰, 사용자 정보)
     */
    async login(identifier, password) {
        try {
            const response = await api.post('/auth/login', { identifier, password });
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            console.error('로그인 실패:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 구글 로그인
     * @param {string} token - 구글 Access Token
     * @returns {Promise} 로그인 결과
     */
    async googleLogin(token) {
        try {
            const response = await api.post('/auth/google', { token });
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            console.error('구글 로그인 실패:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 회원가입
     * @param {Object} userData - 사용자 정보
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.name - 이름
     * @param {string} userData.phoneNumber - 전화번호 (선택)
     * @returns {Promise} 회원가입 결과
     */
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            const { accessToken, refreshToken, user } = response.data;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            }

            return response.data;
        } catch (error) {
            console.error('회원가입 실패:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * 로그아웃
     * @returns {Promise} 로그아웃 결과
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed on server:', error);
        } finally {
            // 서버 요청 실패와 무관하게 클라이언트 세션은 정리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        return { success: true };
    },

    /**
     * 현재 로그인 상태 확인
     * @returns {boolean} 로그인 여부
     */
    isLoggedIn() {
        return !!localStorage.getItem('accessToken');
    },
};

export default authService;
