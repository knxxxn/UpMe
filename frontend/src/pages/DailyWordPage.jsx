import { useState } from 'react'
import { useAuth } from '../components/AuthContext'
import LoginPromptModal from '../components/LoginPromptModal'
import { useToast } from '../components/ToastContext'
import './DailyWordPage.css'

// 샘플 오늘의 단어 데이터
const todayWord = {
    word: 'Serendipity',
    pronunciation: '/ˌsɛrənˈdɪpɪti/',
    partOfSpeech: 'noun',
    meaning: '우연히 좋은 것을 발견하는 능력; 뜻밖의 행운',
    meaningEn: 'The occurrence of events by chance in a happy or beneficial way',
    examples: [
        { en: 'Finding that old photo was pure serendipity.', ko: '그 오래된 사진을 발견한 것은 순전히 우연한 행운이었다.' },
        { en: 'The discovery was a serendipity that changed science.', ko: '그 발견은 과학을 바꾼 뜻밖의 행운이었다.' }
    ],
    synonyms: ['luck', 'fortune', 'chance', 'coincidence'],
    relatedWords: ['serendipitous', 'serendipitously']
}

const previousWords = [
    { word: 'Ephemeral', meaning: '일시적인, 덧없는', saved: true },
    { word: 'Resilience', meaning: '회복력, 탄력성', saved: true },
    { word: 'Ubiquitous', meaning: '어디에나 존재하는', saved: false },
    { word: 'Eloquent', meaning: '웅변적인, 표현력이 좋은', saved: false },
]

function DailyWordPage() {
    const { isLoggedIn } = useAuth()
    const { success, warning } = useToast()
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleSaveWord = () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true)
            return
        }

        setIsSaved(true)
        success('단어가 저장되었습니다!')
    }

    const handlePlayPronunciation = () => {
        // 발음 재생 시뮬레이션
        const utterance = new SpeechSynthesisUtterance(todayWord.word)
        utterance.lang = 'en-US'
        speechSynthesis.speak(utterance)
    }

    return (
        <div className="daily-word-page animate-fade-in">
            <div className="page-header">
                <h1>📚 오늘의 단어</h1>
                <p>매일 새로운 단어를 학습하고 어휘력을 키워보세요</p>
            </div>

            {/* 오늘의 단어 카드 */}
            <div className="word-card-main">
                <div className="word-card-header">
                    <span className="word-badge">Today's Word</span>
                    <button
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleSaveWord}
                        disabled={isSaved}
                    >
                        {isSaved ? '✓ 저장됨' : '💾 저장하기'}
                    </button>
                </div>

                <div className="word-main-content">
                    <h2 className="main-word">{todayWord.word}</h2>
                    <div className="word-pronunciation">
                        <span className="pronunciation-text">{todayWord.pronunciation}</span>
                        <button className="pronunciation-btn" onClick={handlePlayPronunciation}>
                            🔊
                        </button>
                    </div>
                    <span className="part-of-speech">{todayWord.partOfSpeech}</span>
                </div>

                <div className="word-meanings">
                    <div className="meaning-item">
                        <span className="meaning-label">🇰🇷 한국어</span>
                        <p className="meaning-text">{todayWord.meaning}</p>
                    </div>
                    <div className="meaning-item">
                        <span className="meaning-label">🇺🇸 English</span>
                        <p className="meaning-text">{todayWord.meaningEn}</p>
                    </div>
                </div>

                <div className="word-examples">
                    <h3>📝 예문</h3>
                    {todayWord.examples.map((example, idx) => (
                        <div key={idx} className="example-item">
                            <p className="example-en">"{example.en}"</p>
                            <p className="example-ko">{example.ko}</p>
                        </div>
                    ))}
                </div>

                <div className="word-extras">
                    <div className="extra-section">
                        <h4>동의어</h4>
                        <div className="tag-list">
                            {todayWord.synonyms.map((syn, idx) => (
                                <span key={idx} className="word-tag">{syn}</span>
                            ))}
                        </div>
                    </div>
                    <div className="extra-section">
                        <h4>관련 단어</h4>
                        <div className="tag-list">
                            {todayWord.relatedWords.map((rel, idx) => (
                                <span key={idx} className="word-tag related">{rel}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 이전 단어 목록 */}
            <section className="previous-words-section">
                <h2 className="section-title">📖 지난 단어</h2>
                {isLoggedIn ? (
                    <div className="previous-words-grid">
                        {previousWords.map((word, idx) => (
                            <div key={idx} className="previous-word-card">
                                <div className="previous-word-header">
                                    <h3>{word.word}</h3>
                                    {word.saved && <span className="saved-badge">저장됨</span>}
                                </div>
                                <p className="previous-word-meaning">{word.meaning}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="login-required-notice">
                        <span className="notice-icon">🔒</span>
                        <p>로그인하면 지난 단어와 저장한 단어를 확인할 수 있어요!</p>
                        <div className="notice-buttons">
                            <a href="/login" className="btn btn-primary">로그인</a>
                            <a href="/register" className="btn btn-secondary">회원가입</a>
                        </div>
                    </div>
                )}
            </section>

            {/* Login Prompt Modal */}
            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                feature="단어 저장"
                message="단어를 저장하고 나만의 단어장을 만들려면 로그인이 필요합니다."
            />
        </div>
    )
}

export default DailyWordPage
