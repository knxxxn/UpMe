import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import LoginPromptModal from '../components/LoginPromptModal'
import { useAuth } from '../components/AuthContext'
import solvedacService from '../services/solvedacService'
import './CodingPage.css'

function CodingPage() {
    const { roomId } = useParams()
    const { isLoggedIn } = useAuth()
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [results, setResults] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [activeTab, setActiveTab] = useState('result')
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    // 문제 데이터 (solved.ac)
    const [problem, setProblem] = useState(null)
    const [loadingProblem, setLoadingProblem] = useState(true)
    const [problemError, setProblemError] = useState(null)

    // Resizable panel state
    const [resultHeight, setResultHeight] = useState(250)
    const [isResizing, setIsResizing] = useState(false)
    const editorPanelRef = useRef(null)

    useEffect(() => {
        fetchProblem()
    }, [roomId])

    const fetchProblem = async () => {
        setLoadingProblem(true)
        setProblemError(null)
        try {
            const data = await solvedacService.getProblem(roomId)
            setProblem(data)
        } catch (err) {
            console.error('문제 조회 실패:', err)
            setProblemError('문제를 불러오는데 실패했습니다.')
        } finally {
            setLoadingProblem(false)
        }
    }

    // 코드 실행 - 비로그인도 가능
    const handleRun = async () => {
        setIsRunning(true)
        setActiveTab('result')

        // 시뮬레이션: 실제로는 API 호출
        await new Promise(resolve => setTimeout(resolve, 1500))

        setResults([
            { testCase: 1, input: '실행 완료', expected: '-', actual: '-', passed: true },
        ])
        setIsRunning(false)
    }

    // 제출 - 로그인 필요
    const handleSubmit = async () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true)
            return
        }

        setIsRunning(true)
        setActiveTab('result')

        await new Promise(resolve => setTimeout(resolve, 2000))

        setResults([
            { testCase: 1, input: '테스트 1', expected: '-', actual: '-', passed: true },
        ])
        setIsRunning(false)
    }

    // Handle resize start
    const handleResizeStart = useCallback((e) => {
        e.preventDefault()
        setIsResizing(true)

        const startY = e.clientY
        const startHeight = resultHeight

        const handleMouseMove = (e) => {
            if (editorPanelRef.current) {
                const panelRect = editorPanelRef.current.getBoundingClientRect()
                const newHeight = startHeight - (e.clientY - startY)
                const maxHeight = panelRect.height * 0.7
                const clampedHeight = Math.max(100, Math.min(maxHeight, newHeight))
                setResultHeight(clampedHeight)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [resultHeight])

    const passedCount = results.filter(r => r.passed).length

    return (
        <div className={`coding-page ${isResizing ? 'resizing' : ''}`}>
            {/* 좌측: 문제 설명 */}
            <div className="problem-panel">
                {loadingProblem ? (
                    <div className="problem-loading">
                        <div className="loading-spinner"></div>
                        <p>문제를 불러오는 중...</p>
                    </div>
                ) : problemError ? (
                    <div className="problem-error">
                        <p>⚠️ {problemError}</p>
                        <button className="btn btn-primary" onClick={fetchProblem}>다시 시도</button>
                    </div>
                ) : problem ? (
                    <>
                        <div className="problem-header">
                            <span
                                className="difficulty-badge"
                                style={{ background: problem.tierColor }}
                            >
                                {problem.tierName}
                            </span>
                            <h2 className="problem-title">
                                <span className="problem-number">#{problem.id}</span>
                                {problem.title}
                            </h2>
                        </div>

                        <div className="problem-content">
                            <section className="problem-section">
                                <h3>📋 문제 정보</h3>
                                <div className="problem-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">난이도</span>
                                        <span className="meta-value" style={{ color: problem.tierColor }}>
                                            {problem.tierName}
                                        </span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">풀이 수</span>
                                        <span className="meta-value">
                                            {problem.solvedCount?.toLocaleString()}명
                                        </span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">평균 시도</span>
                                        <span className="meta-value">
                                            {problem.averageTries?.toFixed(1)}회
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {problem.tags.length > 0 && (
                                <section className="problem-section">
                                    <h3>🏷️ 알고리즘 분류</h3>
                                    <div className="problem-tags">
                                        {problem.tags.map((tag, idx) => (
                                            <span key={idx} className="algo-tag">{tag}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="problem-section">
                                <h3>📖 문제 보기</h3>
                                <p className="problem-desc-info">
                                    문제의 전체 지문은 백준 사이트에서 확인해주세요.
                                    이곳에서 코드를 작성하고, 백준에서 최종 제출하세요!
                                </p>
                                <a
                                    href={problem.bojUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="boj-link-btn"
                                >
                                    🔗 백준에서 문제 보기 (#{problem.id})
                                </a>
                            </section>

                            <section className="problem-section submit-section">
                                <h3>📤 백준에 제출하기</h3>
                                <p className="problem-desc-info">
                                    코드 작성이 완료되면 백준 사이트에서 제출하세요.
                                </p>
                                <a
                                    href={`https://www.acmicpc.net/submit/${problem.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="boj-submit-btn"
                                >
                                    🚀 백준에 제출하기
                                </a>
                            </section>
                        </div>
                    </>
                ) : null}
            </div>

            {/* 우측: 코드 에디터 + 결과 */}
            <div className="editor-panel" ref={editorPanelRef}>
                <div className="editor-section">
                    <CodeEditor
                        onCodeChange={setCode}
                        onLanguageChange={setLanguage}
                    />
                </div>

                {/* Resizable divider */}
                <div
                    className="panel-resizer"
                    onMouseDown={handleResizeStart}
                >
                    <div className="resizer-handle"></div>
                </div>

                <div className="result-section" style={{ height: `${resultHeight}px` }}>
                    <div className="result-tabs">
                        <button
                            className={`result-tab ${activeTab === 'result' ? 'active' : ''}`}
                            onClick={() => setActiveTab('result')}
                        >
                            실행 결과
                        </button>
                        <button
                            className={`result-tab ${activeTab === 'output' ? 'active' : ''}`}
                            onClick={() => setActiveTab('output')}
                        >
                            출력
                        </button>
                    </div>

                    <div className="result-content">
                        {isRunning ? (
                            <div className="running-indicator">
                                <div className="spinner"></div>
                                <span>실행 중...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="test-results">
                                <div className="results-summary">
                                    <span className={passedCount === results.length ? 'text-success' : 'text-warning'}>
                                        테스트 {passedCount}/{results.length} 통과
                                    </span>
                                </div>
                                <div className="results-list">
                                    {results.map((result) => (
                                        <div
                                            key={result.testCase}
                                            className={`result-item ${result.passed ? 'passed' : 'failed'}`}
                                        >
                                            <span className="result-icon">
                                                {result.passed ? '✓' : '✗'}
                                            </span>
                                            <span className="result-name">테스트 {result.testCase}</span>
                                            {result.input !== '테스트 ' + result.testCase && (
                                                <span className="result-detail">
                                                    입력: {result.input} | 기대값: {result.expected} | 실행결과: {result.actual}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-result">
                                <span>실행 결과가 여기에 표시됩니다</span>
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button
                            className="btn btn-secondary"
                            onClick={handleRun}
                            disabled={isRunning}
                        >
                            ▶ 코드 실행
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={isRunning}
                        >
                            제출 후 채점하기
                        </button>
                    </div>
                </div>
            </div>

            {/* Login Prompt Modal */}
            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                feature="채점 결과 저장"
                message="채점 결과를 저장하고 학습 통계를 확인하려면 로그인이 필요합니다."
            />
        </div>
    )
}

export default CodingPage
