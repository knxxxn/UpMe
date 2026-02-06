/**
 * 채팅 서비스
 * 대화 목록, 메시지 조회, 메시지 전송 API
 * 
 * // TODO: DATABASE 연결 필요
 * // TODO: WebSocket 연결 필요 (실시간 채팅)
 */

import api from './api';

const chatService = {
    /**
     * 대화 목록 조회
     * @returns {Promise} 대화 목록
     */
    async getConversations() {
        // TODO: DATABASE 연결 필요
        // const response = await api.get('/conversations');
        // return response.data;

        // 임시 더미 응답
        console.log('ChatService.getConversations() - DATABASE 연결 필요');
        return {
            conversations: [
                {
                    id: 1,
                    participant: { id: 2, name: '김멘토', profileImage: null },
                    lastMessage: '안녕하세요! 질문이 있으시면 편하게 물어보세요.',
                    lastMessageTime: '2026-01-28T10:30:00',
                    unreadCount: 0,
                },
                {
                    id: 2,
                    participant: { id: 3, name: '이코치', profileImage: null },
                    lastMessage: '오늘 코딩 테스트 준비는 어떻게 되고 있나요?',
                    lastMessageTime: '2026-01-27T15:45:00',
                    unreadCount: 2,
                },
            ],
        };
    },

    /**
     * 특정 대화의 메시지 조회
     * @param {number} conversationId - 대화 ID
     * @param {Object} params - 페이지네이션 파라미터
     * @returns {Promise} 메시지 목록
     */
    async getMessages(conversationId, params = {}) {
        // TODO: DATABASE 연결 필요
        // const response = await api.get(`/conversations/${conversationId}/messages`, { params });
        // return response.data;

        // 임시 더미 응답
        console.log('ChatService.getMessages() - DATABASE 연결 필요', conversationId);
        return {
            messages: [
                {
                    id: 1,
                    senderId: 2,
                    content: '안녕하세요! 무엇을 도와드릴까요?',
                    timestamp: '2026-01-28T10:00:00',
                    isRead: true,
                },
                {
                    id: 2,
                    senderId: 1,
                    content: '알고리즘 문제 풀이에 대해 질문이 있습니다.',
                    timestamp: '2026-01-28T10:05:00',
                    isRead: true,
                },
                {
                    id: 3,
                    senderId: 2,
                    content: '네, 어떤 부분이 궁금하신가요?',
                    timestamp: '2026-01-28T10:30:00',
                    isRead: true,
                },
            ],
            hasMore: false,
        };
    },

    /**
     * 메시지 전송
     * @param {number} conversationId - 대화 ID
     * @param {string} message - 메시지 내용
     * @returns {Promise} 전송된 메시지
     */
    async sendMessage(conversationId, message) {
        // TODO: DATABASE 연결 필요
        // TODO: WebSocket으로 실시간 전송 구현
        // const response = await api.post(`/conversations/${conversationId}/messages`, { content: message });
        // return response.data;

        // 임시 더미 응답
        console.log('ChatService.sendMessage() - DATABASE 연결 필요', { conversationId, message });
        return {
            id: Date.now(),
            senderId: 1,
            content: message,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
    },

    /**
     * 새 대화 시작
     * @param {number} userId - 대화 상대 사용자 ID
     * @returns {Promise} 생성된 대화 정보
     */
    async createConversation(userId) {
        // TODO: DATABASE 연결 필요
        // const response = await api.post('/conversations', { participantId: userId });
        // return response.data;

        console.log('ChatService.createConversation() - DATABASE 연결 필요', userId);
        return {
            id: Date.now(),
            participant: { id: userId, name: '새로운 상대', profileImage: null },
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
        };
    },

    /**
     * 메시지 읽음 처리
     * @param {number} conversationId - 대화 ID
     * @returns {Promise} 처리 결과
     */
    async markAsRead(conversationId) {
        // TODO: DATABASE 연결 필요
        // const response = await api.put(`/conversations/${conversationId}/read`);
        // return response.data;

        console.log('ChatService.markAsRead() - DATABASE 연결 필요', conversationId);
        return { success: true };
    },

    /**
     * 대화 삭제
     * @param {number} conversationId - 대화 ID
     * @returns {Promise} 삭제 결과
     */
    async deleteConversation(conversationId) {
        // TODO: DATABASE 연결 필요
        // const response = await api.delete(`/conversations/${conversationId}`);
        // return response.data;

        console.log('ChatService.deleteConversation() - DATABASE 연결 필요', conversationId);
        return { success: true };
    },

    // ============================================
    // WebSocket 관련 (실시간 채팅)
    // TODO: DATABASE 연결 필요
    // ============================================

    /**
     * WebSocket 연결
     * @param {Function} onMessage - 메시지 수신 콜백
     * @param {Function} onError - 에러 콜백
     */
    connectWebSocket(onMessage, onError) {
        // TODO: WebSocket 연결 구현
        // const ws = new WebSocket(import.meta.env.VITE_WS_URL);
        // ws.onmessage = onMessage;
        // ws.onerror = onError;
        // return ws;

        console.log('ChatService.connectWebSocket() - WebSocket 연결 필요');
        return null;
    },

    /**
     * WebSocket 연결 해제
     * @param {WebSocket} ws - WebSocket 인스턴스
     */
    disconnectWebSocket(ws) {
        // TODO: WebSocket 연결 해제
        // if (ws) ws.close();

        console.log('ChatService.disconnectWebSocket() - WebSocket 연결 해제');
    },
};

export default chatService;
