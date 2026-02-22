import { useState } from 'react'
import { useTheme } from './ThemeContext'
import './ThemeToggle.css'

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [switching, setSwitching] = useState(false)

    const handleClick = () => {
        setSwitching(true)
        setTimeout(() => {
            toggleTheme()
            setSwitching(false)
        }, 200)
    }

    return (
        <button
            className="theme-toggle"
            onClick={handleClick}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
            <span className={`theme-toggle-icon ${switching ? 'switching' : ''}`}>
                {theme === 'dark' ? '🌙' : '☀️'}
            </span>
        </button>
    )
}

export default ThemeToggle
