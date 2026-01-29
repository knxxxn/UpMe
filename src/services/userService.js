/**
 * 사용자 서비스
 * 프로필 조회, 수정, 계정 삭제 API
 * 
 * // TODO: DATABASE 연결 필요
 */

import api from './api';

const userService = {
    /**
     * 프로필 조회
     * @returns {Promise} 사용자 프로필 정보
     */
    async getProfile() {
        // TODO: DATABASE 연결 필요
        // const response = await api.get('/users/profile');
        // return response.data;

        // 임시 더미 응답
        console.log('UserService.getProfile() - DATABASE 연결 필요');
        return {
            id: 1,
            email: 'user@example.com',
            name: '테스트 사용자',
            profileImage: null,
            createdAt: '2026-01-01',
            stats: {
                solvedProblems: 42,
                totalSubmissions: 128,
                successRate: 85,
            },
        };
    },

    /**
     * 프로필 수정
     * @param {Object} data - 수정할 프로필 데이터
     * @param {string} data.name - 이름
     * @param {string} data.profileImage - 프로필 이미지 URL
     * @returns {Promise} 수정된 프로필 정보
     */
    async updateProfile(data) {
        // TODO: DATABASE 연결 필요
        // const response = await api.put('/users/profile', data);
        // return response.data;

        // 임시 더미 응답
        console.log('UserService.updateProfile() - DATABASE 연결 필요', data);
        return {
            success: true,
            message: '프로필이 수정되었습니다.',
            user: { id: 1, ...data },
        };
    },

    /**
     * 비밀번호 변경
     * @param {string} currentPassword - 현재 비밀번호
     * @param {string} newPassword - 새 비밀번호
     * @returns {Promise} 변경 결과
     */
    async changePassword(currentPassword, newPassword) {
        // TODO: DATABASE 연결 필요
        // const response = await api.put('/users/password', { currentPassword, newPassword });
        // return response.data;

        console.log('UserService.changePassword() - DATABASE 연결 필요');
        return {
            success: true,
            message: '비밀번호가 변경되었습니다.',
        };
    },

    /**
     * 계정 삭제
     * @returns {Promise} 삭제 결과
     */
    async deleteAccount() {
        // TODO: DATABASE 연결 필요
        // const response = await api.delete('/users/account');
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // return response.data;

        console.log('UserService.deleteAccount() - DATABASE 연결 필요');
        return {
            success: true,
            message: '계정이 삭제되었습니다.',
        };
    },

    /**
     * 사용자 활동 내역 조회
     * @returns {Promise} 활동 내역
     */
    async getActivityHistory() {
        // TODO: DATABASE 연결 필요
        // const response = await api.get('/users/activity');
        // return response.data;

        console.log('UserService.getActivityHistory() - DATABASE 연결 필요');
        return {
            recentSubmissions: [],
            recentConversations: [],
        };
    },
};

export default userService;
