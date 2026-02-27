/**
 * 대화 기록 서비스
 * 대화 목록 조회, 생성, 메시지 조회/전송, 삭제 API
 */

import api from './api'

const conversationService = {
    /**
     * 내 대화 목록 조회
     * @returns {Promise} 대화 목록 [{ id, topicId, title, createdAt, updatedAt }]
     */
    async getConversations() {
        const response = await api.get('/conversations')
        return response.data
    },

    /**
     * 새 대화 생성
     * @param {number} topicId - 토픽 ID (1~6)
     * @returns {Promise} { id, topicId, title }
     */
    async createConversation(topicId) {
        const response = await api.post('/conversations', { topicId })
        return response.data
    },

    /**
     * 대화 메시지 조회
     * @param {number} conversationId - 대화 ID
     * @returns {Promise} 메시지 목록 [{ id, role, content, feedback, createdAt }]
     */
    async getMessages(conversationId) {
        const response = await api.get(`/conversations/${conversationId}/messages`)
        return response.data
    },

    /**
     * 메시지 전송 (AI 응답 포함)
     * @param {number} conversationId - 대화 ID
     * @param {string} message - 사용자 메시지
     * @param {number} topicId - 토픽 ID
     * @param {Array} history - 대화 히스토리
     * @returns {Promise} { reply, feedback }
     */
    async sendMessage(conversationId, message, topicId, history) {
        const response = await api.post(`/conversations/${conversationId}/messages`, {
            message,
            topicId,
            history,
        }, {
            timeout: 30000,
        })
        return response.data
    },

    /**
     * 대화 삭제
     * @param {number} conversationId - 대화 ID
     * @returns {Promise}
     */
    async deleteConversation(conversationId) {
        const response = await api.delete(`/conversations/${conversationId}`)
        return response.data
    },
}

export default conversationService
