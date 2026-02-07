import { useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import LoginPromptModal from '../components/LoginPromptModal'
import { useAuth } from '../components/AuthContext'
import './CodingPage.css'

// 샘플 문제 데이터
const sampleProblem = {
    id: 1,
    title: '두 수의 합',
    difficulty: 'Lv. 1',
    description: `두 정수 a, b가 주어졌을 때, a와 b의 합을 return 하는 solution 함수를 완성해주세요.`,
    constraints: [
        '-100,000 ≤ a, b ≤ 100,000'
    ],
    examples: [
        { input: 'a = 3, b = 5', output: '8' },
        { input: 'a = -2, b = 7', output: '5' }
    ],
    exampleExplanation: '첫번째 예제에서 3 + 5 = 8이므로 8을 return 합니다.'
}

function CodingPage() {
    const { roomId } = useParams()
    const { isLoggedIn } = useAuth()
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [results, setResults] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [activeTab, setActiveTab] = useState('result')
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    // Resizable panel state
    const [resultHeight, setResultHeight] = useState(250)
    const [isResizing, setIsResizing] = useState(false)
    const editorPanelRef = useRef(null)

    // 코드 실행 - 비로그인도 가능
    const handleRun = async () => {
        setIsRunning(true)
        setActiveTab('result')

        // 시뮬레이션: 실제로는 API 호출
        await new Promise(resolve => setTimeout(resolve, 1500))

        setResults([
            { testCase: 1, input: 'a=3, b=5', expected: '8', actual: '8', passed: true },
            { testCase: 2, input: 'a=-2, b=7', expected: '5', actual: '5', passed: true }
        ])
        setIsRunning(false)
    }

    // 제출 - 로그인 필요
    const handleSubmit = async () => {
        // 로그인 체크
        if (!isLoggedIn) {
            setShowLoginPrompt(true)
            return
        }

        setIsRunning(true)
        setActiveTab('result')

        await new Promise(resolve => setTimeout(resolve, 2000))

        setResults([
            { testCase: 1, input: 'a=3, b=5', expected: '8', actual: '8', passed: true },
            { testCase: 2, input: 'a=-2, b=7', expected: '5', actual: '5', passed: true },
            { testCase: 3, input: '테스트 3', expected: '-', actual: '-', passed: true },
            { testCase: 4, input: '테스트 4', expected: '-', actual: '-', passed: true },
            { testCase: 5, input: '테스트 5', expected: '-', actual: '-', passed: true }
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
                <div className="problem-header">
                    <span className="difficulty-badge">{sampleProblem.difficulty}</span>
                    <h2 className="problem-title">{sampleProblem.title}</h2>
                </div>

                <div className="problem-content">
                    <section className="problem-section">
                        <h3>문제 설명</h3>
                        <p>{sampleProblem.description}</p>
                    </section>

                    <section className="problem-section">
                        <h3>제한사항</h3>
                        <ul className="constraints-list">
                            {sampleProblem.constraints.map((constraint, idx) => (
                                <li key={idx}>{constraint}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="problem-section">
                        <h3>입출력 예</h3>
                        <table className="examples-table">
                            <thead>
                                <tr>
                                    <th>a</th>
                                    <th>b</th>
                                    <th>result</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>3</td>
                                    <td>5</td>
                                    <td>8</td>
                                </tr>
                                <tr>
                                    <td>-2</td>
                                    <td>7</td>
                                    <td>5</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="problem-section">
                        <h3>입출력 예 설명</h3>
                        <p>{sampleProblem.exampleExplanation}</p>
                    </section>
                </div>
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
