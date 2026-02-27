/**
 * 사용자 서비스
 * 프로필 조회, 수정, 계정 삭제 API
 */

import api from './api';

const userService = {
    /**
     * 프로필 수정
     * @param {Object} data - 수정할 프로필 데이터
     * @param {string} data.name - 이름
     * @param {string} data.phoneNumber - 휴대폰 번호
     * @returns {Promise} 수정된 프로필 정보
     */
    async updateProfile(data) {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    /**
     * 활동 내역 조회
     * @returns {Promise} 활동 내역 데이터
     */
    async getActivityHistory() {
        const response = await api.get('/users/activity');
        return response.data;
    },

    /**
     * 통계 조회
     * @returns {Promise} 통계 데이터
     */
    async getUserStats() {
        const response = await api.get('/users/stats');
        return response.data;
    },

    /**
     * 계정 삭제
     * @returns {Promise} 삭제 결과
     */
    async deleteAccount() {
        const response = await api.delete('/users/account');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return response.data;
    },
};

export default userService;
