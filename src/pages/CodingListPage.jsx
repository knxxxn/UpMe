import { Link } from 'react-router-dom'
import './CodingListPage.css'

const problems = [
    { id: 1, title: '두 수의 합', difficulty: 'Lv. 1', category: '정수', solved: true, accuracy: '89%' },
    { id: 2, title: '문자열 뒤집기', difficulty: 'Lv. 1', category: '문자열', solved: true, accuracy: '92%' },
    { id: 3, title: '배열의 평균', difficulty: 'Lv. 1', category: '배열', solved: false, accuracy: '85%' },
    { id: 4, title: '피보나치 수열', difficulty: 'Lv. 2', category: '재귀', solved: false, accuracy: '67%' },
    { id: 5, title: '이진 탐색', difficulty: 'Lv. 2', category: '탐색', solved: false, accuracy: '72%' },
    { id: 6, title: '최단 경로', difficulty: 'Lv. 3', category: '그래프', solved: false, accuracy: '45%' },
]

const difficultyColors = {
    'Lv. 1': '#10b981',
    'Lv. 2': '#f59e0b',
    'Lv. 3': '#ef4444',
}

function CodingListPage() {
    return (
        <div className="coding-list-page animate-fade-in">
            <div className="page-header">
                <h1>코딩 테스트</h1>
                <p>알고리즘 문제를 풀고 실력을 향상시키세요</p>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label className="filter-label">난이도</label>
                    <div className="filter-buttons">
                        <button className="filter-btn active">전체</button>
                        <button className="filter-btn">Lv. 1</button>
                        <button className="filter-btn">Lv. 2</button>
                        <button className="filter-btn">Lv. 3</button>
                    </div>
                </div>
                <div className="filter-group">
                    <label className="filter-label">상태</label>
                    <div className="filter-buttons">
                        <button className="filter-btn active">전체</button>
                        <button className="filter-btn">풀이 완료</button>
                        <button className="filter-btn">미풀이</button>
                    </div>
                </div>
            </div>

            <div className="problems-section">
                <table className="problems-table">
                    <thead>
                        <tr>
                            <th>상태</th>
                            <th>제목</th>
                            <th>난이도</th>
                            <th>카테고리</th>
                            <th>정답률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((problem) => (
                            <tr key={problem.id}>
                                <td>
                                    <span className={`status-icon ${problem.solved ? 'solved' : ''}`}>
                                        {problem.solved ? '✓' : '○'}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/coding/${problem.id}`} className="problem-link">
                                        {problem.title}
                                    </Link>
                                </td>
                                <td>
                                    <span
                                        className="difficulty-tag"
                                        style={{ color: difficultyColors[problem.difficulty] }}
                                    >
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td>
                                    <span className="category-tag">{problem.category}</span>
                                </td>
                                <td>
                                    <span className="accuracy">{problem.accuracy}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button className="page-btn">◀</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">▶</button>
            </div>
        </div>
    )
}

export default CodingListPage
