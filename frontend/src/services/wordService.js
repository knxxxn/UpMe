/**
 * 단어 서비스
 * 랜덤 단어 조회, 단어 저장/취소/목록 API
 */

import api from './api';

const wordService = {
    /**
     * 랜덤 단어 3개 조회 (비로그인 가능)
     */
    async getRandomWords() {
        try {
            const response = await api.get('/words/random');
            return response.data;
        } catch (error) {
            console.error('랜덤 단어 조회 실패:', error);
            throw error;
        }
    },

    /**
     * 단어 저장
     * @param {number} wordId - 저장할 단어 ID
     */
    async saveWord(wordId) {
        try {
            const response = await api.post(`/words/${wordId}/save`);
            return response.data;
        } catch (error) {
            console.error('단어 저장 실패:', error);
            throw error;
        }
    },

    /**
     * 단어 저장 취소
     * @param {number} wordId - 취소할 단어 ID
     */
    async unsaveWord(wordId) {
        try {
            const response = await api.delete(`/words/${wordId}/save`);
            return response.data;
        } catch (error) {
            console.error('단어 저장 취소 실패:', error);
            throw error;
        }
    },

    /**
     * 저장한 단어 목록 조회
     */
    async getSavedWords() {
        try {
            const response = await api.get('/words/saved');
            return response.data;
        } catch (error) {
            console.error('저장 단어 조회 실패:', error);
            throw error;
        }
    }
};

export default wordService;
