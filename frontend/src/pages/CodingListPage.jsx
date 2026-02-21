import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import solvedacService, { getTierInfo, getUserSolvedProblems } from '../services/solvedacService'
import './CodingListPage.css'

const TIER_FILTERS = [
    { key: 'all', label: '전체' },
    { key: 'bronze', label: 'Bronze', color: '#ad5600' },
    { key: 'silver', label: 'Silver', color: '#435f7a' },
    { key: 'gold', label: 'Gold', color: '#ec9a00' },
    { key: 'platinum', label: 'Platinum', color: '#27e2a4' },
    { key: 'diamond', label: 'Diamond', color: '#00b4fc' },
]

const SORT_OPTIONS = [
    { key: 'solved', label: '풀이 많은순' },
    { key: 'level', label: '난이도순' },
    { key: 'id', label: '번호순' },
]

const ITEMS_PER_PAGE = 50

function CodingListPage() {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tierFilter, setTierFilter] = useState('all')
    const [sort, setSort] = useState('solved')
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [solvedIds, setSolvedIds] = useState(new Set())

    useEffect(() => {
        fetchProblems()
    }, [tierFilter, sort, page])

    // 유저의 풀이 기록 가져오기
    useEffect(() => {
        loadSolvedProblems()
    }, [])

    const loadSolvedProblems = async () => {
        try {
            const storedUser = localStorage.getItem('user')
            if (!storedUser) return
            const userData = JSON.parse(storedUser)
            const handle = userData.bojHandle
            if (!handle) return

            const ids = new Set()
            let page = 1
            let hasMore = true
            // 최대 10페이지 (500개)까지만 가져오기
            while (hasMore && page <= 10) {
                const result = await getUserSolvedProblems(handle, page)
                result.problems.forEach(p => ids.add(p.id))
                hasMore = ids.size < result.count && result.problems.length > 0
                page++
            }
            setSolvedIds(ids)
        } catch (err) {
            console.error('풀이 기록 로딩 실패:', err)
        }
    }

    const fetchProblems = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await solvedacService.searchProblems(tierFilter, page, sort, 'desc')
            setProblems(result.problems)
            setTotalCount(result.count)
        } catch (err) {
            console.error('문제 로딩 실패:', err)
            setError('문제를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const maxVisiblePages = 5
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    const handleTierFilter = (key) => {
        setTierFilter(key)
        setPage(1)
    }

    const handleSort = (key) => {
        setSort(key)
        setPage(1)
    }

    return (
        <div className="coding-list-page animate-fade-in">
            <div className="page-header">
                <h1>💻 코딩 테스트</h1>
                <p>백준 Online Judge 문제를 풀고 실력을 향상시키세요</p>
            </div>

            {/* 필터 */}
            <div className="filters-section">
                <div className="filter-group">
                    <label className="filter-label">난이도</label>
                    <div className="filter-buttons">
                        {TIER_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={`filter-btn ${tierFilter === f.key ? 'active' : ''}`}
                                onClick={() => handleTierFilter(f.key)}
                                style={tierFilter === f.key && f.color ? {
                                    background: f.color,
                                    borderColor: f.color
                                } : {}}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-group">
                    <label className="filter-label">정렬</label>
                    <div className="filter-buttons">
                        {SORT_OPTIONS.map((s) => (
                            <button
                                key={s.key}
                                className={`filter-btn ${sort === s.key ? 'active' : ''}`}
                                onClick={() => handleSort(s.key)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 문제 목록 */}
            {error ? (
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="btn btn-primary" onClick={fetchProblems}>다시 시도</button>
                </div>
            ) : loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>문제를 불러오는 중...</p>
                </div>
            ) : (
                <>
                    <div className="problems-section">
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th>상태</th>
                                    <th>번호</th>
                                    <th>제목</th>
                                    <th>난이도</th>
                                    <th>알고리즘</th>
                                    <th>풀이 수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.map((problem) => (
                                    <tr key={problem.id} className={solvedIds.has(problem.id) ? 'solved-row' : ''}>
                                        <td>
                                            {solvedIds.has(problem.id) ? (
                                                <span className="solved-check">✔</span>
                                            ) : (
                                                <span className="unsolved-mark">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="problem-id">{problem.id}</span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/coding/${problem.id}`}
                                                className="problem-link"
                                            >
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <span
                                                className="difficulty-tag"
                                                style={{ color: problem.tierColor }}
                                            >
                                                {problem.tierName}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="tag-list">
                                                {problem.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="category-tag">{tag}</span>
                                                ))}
                                                {problem.tags.length > 3 && (
                                                    <span className="category-tag more">+{problem.tags.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="solved-count">
                                                {problem.solvedCount?.toLocaleString()}명
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                ◀
                            </button>
                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
                                <button
                                    key={p}
                                    className={`page-btn ${page === p ? 'active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="page-btn"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                ▶
                            </button>
                        </div>
                    )}

                    <p className="results-info">
                        총 {totalCount.toLocaleString()}개 문제 중 {((page - 1) * ITEMS_PER_PAGE) + 1}~{Math.min(page * ITEMS_PER_PAGE, totalCount)}
                    </p>
                </>
            )}
        </div>
    )
}

export default CodingListPage
