import { useEffect, useState } from 'react';
import './Toast.css';

const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
};

function Toast({ message, type = 'info', onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 2700);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={handleClose}>
                ✕
            </button>
        </div>
    );
}

export default Toast;
