import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import wordService from '../services/wordService'
import './WordBookPage.css'

function WordBookPage() {
    const { isLoggedIn } = useAuth()
    const { success, error: showError } = useToast()
    const [savedWords, setSavedWords] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isLoggedIn) {
            fetchSavedWords()
        } else {
            setLoading(false)
        }
    }, [isLoggedIn])

    const fetchSavedWords = async () => {
        setLoading(true)
        try {
            const data = await wordService.getSavedWords()
            setSavedWords(data)
        } catch (err) {
            console.error('저장 단어 로딩 실패:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnsaveWord = async (wordId) => {
        try {
            await wordService.unsaveWord(wordId)
            setSavedWords(prev => prev.filter(w => w.id !== wordId))
            success('단어 저장이 취소되었습니다.')
        } catch (err) {
            showError('단어 저장 취소에 실패했습니다.')
        }
    }

    const handlePlayPronunciation = (englishWord) => {
        const utterance = new SpeechSynthesisUtterance(englishWord)
        utterance.lang = 'en-US'
        speechSynthesis.speak(utterance)
    }

    return (
        <div className="wordbook-page animate-fade-in">
            <div className="page-header">
                <h1>📚 나만의 단어장 📚</h1>
                <p>저장한 단어들을 복습하세요</p>
            </div>

            {!isLoggedIn ? (
                <div className="login-required-notice">
                    <span className="notice-icon">🔒</span>
                    <p>로그인하면 저장한 단어를 확인할 수 있어요!</p>
                    <div className="notice-buttons">
                        <Link to="/login" className="btn btn-primary">로그인</Link>
                        <Link to="/register" className="btn btn-secondary">회원가입</Link>
                    </div>
                </div>
            ) : loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>단어를 불러오는 중...</p>
                </div>
            ) : savedWords.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📝</span>
                    <h3>저장한 단어가 없습니다</h3>
                    <p>오늘의 단어에서 마음에 드는 단어를 저장해보세요!</p>
                    <Link to="/daily-word" className="btn btn-primary">오늘의 단어 보러가기</Link>
                </div>
            ) : (
                <>
                    <p className="word-count">총 <strong>{savedWords.length}</strong>개의 단어</p>
                    <div className="word-cards-grid">
                        {savedWords.map((word) => (
                            <div key={word.id} className="word-card-main">
                                <div className="word-card-header">
                                    <span className="word-badge">Saved</span>
                                    <button
                                        className="unsave-btn"
                                        onClick={() => handleUnsaveWord(word.id)}
                                        title="저장 취소"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="word-main-content">
                                    <h2 className="main-word">{word.english}</h2>
                                    <div className="word-pronunciation">
                                        <button className="pronunciation-btn" onClick={() => handlePlayPronunciation(word.english)}>
                                            🔊 발음 듣기
                                        </button>
                                    </div>
                                </div>

                                <div className="word-meanings">
                                    <div className="meaning-item">
                                        <span className="meaning-label">🇰🇷 한국어</span>
                                        <p className="meaning-text">{word.korean}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default WordBookPage
