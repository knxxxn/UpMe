import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeContext'
import { ToastProvider } from './components/ToastContext'
import { AuthProvider } from './components/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CodingPage from './pages/CodingPage'
import CodingListPage from './pages/CodingListPage'
import ConversationPage from './pages/ConversationPage'
import ChatRoom from './pages/ChatRoom'
import MyPage from './pages/MyPage'
import DailyWordPage from './pages/DailyWordPage'
import WordBookPage from './pages/WordBookPage'
import './App.css'

import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
    return (
        <GoogleOAuthProvider clientId="603271573899-fj6hfvaml85gfbktf3u154avuuu168uo.apps.googleusercontent.com">
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                        <div className="app-layout">
                            <Sidebar />
                            <div className="main-content">
                                <Header />
                                <main className="page-content">
                                    <Routes>
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                        <Route path="/coding" element={<CodingListPage />} />
                                        <Route path="/coding/:roomId" element={<CodingPage />} />
                                        <Route path="/conversation" element={<ConversationPage />} />
                                        <Route path="/conversation/:roomId" element={<ChatRoom />} />
                                        <Route path="/mypage" element={<MyPage />} />
                                        <Route path="/daily-word" element={<DailyWordPage />} />
                                        <Route path="/wordbook" element={<WordBookPage />} />
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    </ToastProvider>
                </AuthProvider>
            </ThemeProvider>
        </GoogleOAuthProvider>
    )
}

export default App
