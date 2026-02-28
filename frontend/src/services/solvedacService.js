import api from './api'

const BASE_URL = '/solvedac'

// solved.ac 난이도 레벨 (0~30) → 이름/색상 매핑
const TIER_INFO = {
    0: { name: 'Unrated', tier: 'unrated', color: '#818996' },
    1: { name: 'Bronze V', tier: 'bronze', color: '#9d4900' },
    2: { name: 'Bronze IV', tier: 'bronze', color: '#a54f00' },
    3: { name: 'Bronze III', tier: 'bronze', color: '#ad5600' },
    4: { name: 'Bronze II', tier: 'bronze', color: '#b55d0a' },
    5: { name: 'Bronze I', tier: 'bronze', color: '#c67739' },
    6: { name: 'Silver V', tier: 'silver', color: '#38546e' },
    7: { name: 'Silver IV', tier: 'silver', color: '#3d5a74' },
    8: { name: 'Silver III', tier: 'silver', color: '#435f7a' },
    9: { name: 'Silver II', tier: 'silver', color: '#496580' },
    10: { name: 'Silver I', tier: 'silver', color: '#4e6a86' },
    11: { name: 'Gold V', tier: 'gold', color: '#d28500' },
    12: { name: 'Gold IV', tier: 'gold', color: '#df8f00' },
    13: { name: 'Gold III', tier: 'gold', color: '#ec9a00' },
    14: { name: 'Gold II', tier: 'gold', color: '#f9a518' },
    15: { name: 'Gold I', tier: 'gold', color: '#ffb028' },
    16: { name: 'Platinum V', tier: 'platinum', color: '#00c78b' },
    17: { name: 'Platinum IV', tier: 'platinum', color: '#00d497' },
    18: { name: 'Platinum III', tier: 'platinum', color: '#27e2a4' },
    19: { name: 'Platinum II', tier: 'platinum', color: '#3ef0b1' },
    20: { name: 'Platinum I', tier: 'platinum', color: '#51fdbd' },
    21: { name: 'Diamond V', tier: 'diamond', color: '#009ee5' },
    22: { name: 'Diamond IV', tier: 'diamond', color: '#00a9f0' },
    23: { name: 'Diamond III', tier: 'diamond', color: '#00b4fc' },
    24: { name: 'Diamond II', tier: 'diamond', color: '#2bbfff' },
    25: { name: 'Diamond I', tier: 'diamond', color: '#41caff' },
    26: { name: 'Ruby V', tier: 'ruby', color: '#e0004c' },
    27: { name: 'Ruby IV', tier: 'ruby', color: '#ea0053' },
    28: { name: 'Ruby III', tier: 'ruby', color: '#f5005a' },
    29: { name: 'Ruby II', tier: 'ruby', color: '#ff0062' },
    30: { name: 'Ruby I', tier: 'ruby', color: '#ff3071' },
}

// 난이도 필터용 tier 범위
const TIER_RANGES = {
    all: '*',
    bronze: 'tier:b5..b1',
    silver: 'tier:s5..s1',
    gold: 'tier:g5..g1',
    platinum: 'tier:p5..p1',
    diamond: 'tier:d5..d1',
}

/**
 * 난이도 레벨 정보 반환
 */
export function getTierInfo(level) {
    return TIER_INFO[level] || TIER_INFO[0]
}

/**
 * 난이도 필터 범위 목록 반환
 */
export function getTierRanges() {
    return TIER_RANGES
}

/**
 * 문제 검색
 * @param {string} tierFilter - 난이도 필터 키 (all, bronze, silver, gold, etc.)
 * @param {number} page - 페이지 번호 (1부터)
 * @param {string} sort - 정렬 기준 (solved, level, id)
 * @param {string} direction - 정렬 방향 (asc, desc)
 */
export async function searchProblems(tierFilter = 'all', page = 1, sort = 'solved', direction = 'desc') {
    const query = TIER_RANGES[tierFilter] || '*'
    const params = new URLSearchParams({
        query,
        page: page.toString(),
        sort,
        direction,
    })

    try {
        const response = await api.get(`${BASE_URL}/search/problem?${params}`)
        return {
            count: response.data.count,
            problems: response.data.items.map(transformProblem),
        }
    } catch (error) {
        throw new Error('문제 검색 실패')
    }
}

/**
 * 개별 문제 상세 조회
 * @param {number} problemId - 백준 문제 번호
 */
export async function getProblem(problemId) {
    try {
        const response = await api.get(`${BASE_URL}/problem/show?problemId=${problemId}`)
        return transformProblem(response.data)
    } catch (error) {
        throw new Error('문제 조회 실패')
    }
}

/**
 * API 응답을 우리 앱에서 사용하는 형태로 변환
 */
function transformProblem(item) {
    const tierInfo = getTierInfo(item.level)
    const tags = item.tags?.map(tag => {
        const ko = tag.displayNames?.find(d => d.language === 'ko')
        return ko?.name || tag.key
    }) || []

    return {
        id: item.problemId,
        title: item.titleKo,
        level: item.level,
        tierName: tierInfo.name,
        tierColor: tierInfo.color,
        tier: tierInfo.tier,
        tags,
        solvedCount: item.acceptedUserCount,
        averageTries: item.averageTries,
        bojUrl: `https://www.acmicpc.net/problem/${item.problemId}`,
    }
}

/**
 * solved.ac 유저 정보 조회
 * @param {string} handle - 백준 아이디
 */
export async function getUserInfo(handle) {
    try {
        const response = await api.get(`${BASE_URL}/user/show?handle=${encodeURIComponent(handle)}`)
        const data = response.data
        const tierInfo = getTierInfo(data.tier > 30 ? 30 : data.tier)
        return {
            handle: data.handle,
            bio: data.bio,
            profileImageUrl: data.profileImageUrl,
            solvedCount: data.solvedCount,
            tier: data.tier,
            tierName: tierInfo.name,
            tierColor: tierInfo.color,
            rating: data.rating,
            classNum: data.class,
            maxStreak: data.maxStreak,
            rank: data.rank,
        }
    } catch (error) {
        throw new Error('유저 정보 조회 실패')
    }
}

/**
 * 유저가 푼 문제 ID 목록 가져오기 (페이지별 50개)
 * @param {string} handle - 백준 아이디
 * @param {number} page - 페이지 번호
 */
export async function getUserSolvedProblems(handle, page = 1) {
    const params = new URLSearchParams({
        query: `solved_by:${handle}`,
        page: page.toString(),
        sort: 'level',
        direction: 'desc',
    })
    try {
        const response = await api.get(`${BASE_URL}/search/problem?${params}`)
        return {
            count: response.data.count,
            problems: response.data.items.map(transformProblem),
        }
    } catch (error) {
        throw new Error('풀이 기록 조회 실패')
    }
}

const solvedacService = {
    searchProblems,
    getProblem,
    getTierInfo,
    getTierRanges,
    getUserInfo,
    getUserSolvedProblems,
}

export default solvedacService
