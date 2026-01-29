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
     * @param {string} email - 사용자 이메일
     * @param {string} password - 비밀번호
     * @returns {Promise} 로그인 결과 (토큰, 사용자 정보)
     */
    async login(email, password) {
        // TODO: DATABASE 연결 필요
        // const response = await api.post('/auth/login', { email, password });
        // localStorage.setItem('accessToken', response.data.accessToken);
        // localStorage.setItem('refreshToken', response.data.refreshToken);
        // return response.data;

        // 임시 더미 응답
        console.log('AuthService.login() - DATABASE 연결 필요', { email });
        return {
            success: true,
            user: { id: 1, email, name: '테스트 사용자' },
            accessToken: 'dummy-access-token',
            refreshToken: 'dummy-refresh-token',
        };
    },

    /**
     * 회원가입
     * @param {Object} userData - 사용자 정보
     * @param {string} userData.email - 이메일
     * @param {string} userData.password - 비밀번호
     * @param {string} userData.name - 이름
     * @returns {Promise} 회원가입 결과
     */
    async register(userData) {
        // TODO: DATABASE 연결 필요
        // const response = await api.post('/auth/register', userData);
        // return response.data;

        // 임시 더미 응답
        console.log('AuthService.register() - DATABASE 연결 필요', userData);
        return {
            success: true,
            message: '회원가입이 완료되었습니다.',
            user: { id: 1, ...userData },
        };
    },

    /**
     * 로그아웃
     * @returns {Promise} 로그아웃 결과
     */
    async logout() {
        // TODO: DATABASE 연결 필요
        // await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        console.log('AuthService.logout() - DATABASE 연결 필요');
        return { success: true };
    },

    /**
     * 토큰 갱신
     * @returns {Promise} 새로운 토큰
     */
    async refreshToken() {
        // TODO: DATABASE 연결 필요
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await api.post('/auth/refresh', { refreshToken });
        // localStorage.setItem('accessToken', response.data.accessToken);
        // return response.data;

        console.log('AuthService.refreshToken() - DATABASE 연결 필요');
        return {
            accessToken: 'new-dummy-access-token',
        };
    },

    /**
     * 현재 로그인 상태 확인
     * @returns {boolean} 로그인 여부
     */
    isLoggedIn() {
        return !!localStorage.getItem('accessToken');
    },

    /**
     * 저장된 토큰 가져오기
     * @returns {string|null} 액세스 토큰
     */
    getToken() {
        return localStorage.getItem('accessToken');
    },
};

export default authService;
