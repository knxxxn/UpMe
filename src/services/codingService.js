/**
 * 코딩 테스트 서비스
 * 문제 목록, 상세 조회, 코드 제출, 결과 조회 API
 * 
 * // TODO: DATABASE 연결 필요
 */

import api from './api';

const codingService = {
    /**
     * 문제 목록 조회
     * @param {Object} params - 검색 파라미터
     * @param {number} params.page - 페이지 번호
     * @param {number} params.limit - 페이지당 항목 수
     * @param {string} params.difficulty - 난이도 필터
     * @param {string} params.category - 카테고리 필터
     * @returns {Promise} 문제 목록
     */
    async getProblems(params = {}) {
        // TODO: DATABASE 연결 필요
        // const response = await api.get('/problems', { params });
        // return response.data;

        // 임시 더미 응답
        console.log('CodingService.getProblems() - DATABASE 연결 필요', params);
        return {
            problems: [
                { id: 1, title: '두 수의 합', difficulty: 'easy', category: '배열', solvedCount: 1234 },
                { id: 2, title: '문자열 뒤집기', difficulty: 'easy', category: '문자열', solvedCount: 987 },
                { id: 3, title: '이진 탐색', difficulty: 'medium', category: '탐색', solvedCount: 654 },
            ],
            total: 3,
            page: 1,
            totalPages: 1,
        };
    },

    /**
     * 문제 상세 조회
     * @param {number} id - 문제 ID
     * @returns {Promise} 문제 상세 정보
     */
    async getProblemById(id) {
        // TODO: DATABASE 연결 필요
        // const response = await api.get(`/problems/${id}`);
        // return response.data;

        // 임시 더미 응답
        console.log('CodingService.getProblemById() - DATABASE 연결 필요', id);
        return {
            id,
            title: '두 수의 합',
            description: '정수 배열 nums와 정수 target이 주어질 때, 합이 target이 되는 두 숫자의 인덱스를 반환하세요.',
            difficulty: 'easy',
            category: '배열',
            examples: [
                { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
            ],
            constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
            starterCode: {
                javascript: 'function solution(nums, target) {\n  // 여기에 코드를 작성하세요\n  return [];\n}',
                python: 'def solution(nums, target):\n    # 여기에 코드를 작성하세요\n    return []',
            },
        };
    },

    /**
     * 코드 제출
     * @param {number} problemId - 문제 ID
     * @param {string} code - 제출 코드
     * @param {string} language - 프로그래밍 언어
     * @returns {Promise} 제출 결과 (submissionId)
     */
    async submitCode(problemId, code, language) {
        // TODO: DATABASE 연결 필요
        // const response = await api.post('/submissions', { problemId, code, language });
        // return response.data;

        // 임시 더미 응답
        console.log('CodingService.submitCode() - DATABASE 연결 필요', { problemId, language });
        return {
            submissionId: Date.now(),
            status: 'pending',
            message: '채점 중입니다...',
        };
    },

    /**
     * 제출 결과 조회
     * @param {number} submissionId - 제출 ID
     * @returns {Promise} 채점 결과
     */
    async getSubmissionResult(submissionId) {
        // TODO: DATABASE 연결 필요
        // const response = await api.get(`/submissions/${submissionId}`);
        // return response.data;

        // 임시 더미 응답
        console.log('CodingService.getSubmissionResult() - DATABASE 연결 필요', submissionId);
        return {
            submissionId,
            status: 'completed',
            result: 'success',
            passedTests: 5,
            totalTests: 5,
            runtime: '12ms',
            memory: '42.1MB',
            feedback: '정답입니다!',
        };
    },

    /**
     * 코드 실행 (테스트)
     * @param {number} problemId - 문제 ID
     * @param {string} code - 실행할 코드
     * @param {string} language - 프로그래밍 언어
     * @param {string} customInput - 사용자 정의 입력 (옵션)
     * @returns {Promise} 실행 결과
     */
    async runCode(problemId, code, language, customInput = null) {
        // TODO: DATABASE 연결 필요
        // const response = await api.post('/run', { problemId, code, language, customInput });
        // return response.data;

        console.log('CodingService.runCode() - DATABASE 연결 필요', { problemId, language });
        return {
            output: '[0, 1]',
            runtime: '8ms',
            status: 'success',
        };
    },

    /**
     * 제출 이력 조회
     * @param {number} problemId - 문제 ID
     * @returns {Promise} 제출 이력
     */
    async getSubmissionHistory(problemId) {
        // TODO: DATABASE 연결 필요
        // const response = await api.get(`/problems/${problemId}/submissions`);
        // return response.data;

        console.log('CodingService.getSubmissionHistory() - DATABASE 연결 필요', problemId);
        return {
            submissions: [],
        };
    },
};

export default codingService;
