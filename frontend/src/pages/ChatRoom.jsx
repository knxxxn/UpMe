import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './ChatRoom.css'

const initialMessages = [
    {
        id: 1,
        role: 'ai',
        content: "Hello! I'm your AI conversation partner. What would you like to talk about today?",
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
]

function ChatRoom() {
    const { roomId } = useParams()
    const [messages, setMessages] = useState(initialMessages)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = {
            id: messages.length + 1,
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // AI 응답 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1500))

        const aiResponses = [
            "That's interesting! Can you tell me more about it?",
            "I understand. How does that make you feel?",
            "Great point! What do you think about the other aspects?",
            "I see what you mean. Let me share my thoughts on this.",
            "That's a wonderful perspective. Have you considered this angle?"
        ]

        const aiMessage = {
            id: messages.length + 2,
            role: 'ai',
            content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="chat-room animate-fade-in">
            <div className="chat-header">
                <div className="chat-info">
                    <div className="chat-avatar">🤖</div>
                    <div>
                        <h2 className="chat-title">AI 회화 파트너</h2>
                        <span className="chat-status">● 활성</span>
                    </div>
                </div>
                <div className="chat-actions">
                    <button className="icon-btn" title="설정">⚙️</button>
                    <button className="icon-btn" title="도움말">❓</button>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.role === 'user' ? 'user' : 'ai'}`}
                    >
                        {message.role === 'ai' && (
                            <div className="message-avatar">🤖</div>
                        )}
                        <div className="message-content">
                            <p className="message-text">{message.content}</p>
                            <span className="message-time">{message.timestamp}</span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message ai">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        rows={1}
                        className="message-input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="send-btn"
                    >
                        ➤
                    </button>
                </div>
                <div className="input-hint">
                    <span>Shift + Enter로 줄바꿈</span>
                </div>
            </div>
        </div>
    )
}

export default ChatRoom
