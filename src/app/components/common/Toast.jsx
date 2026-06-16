// src/app/components/common/Toast.jsx
'use client';

import { useEffect } from 'react';

export function Toast({ message, type = 'error', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const colors = {
        error: 'bg-red-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    };

    const icons = {
        error: '❌',
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️',
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div className={`${colors[type] || 'bg-gray-800'} text-white px-6 py-3 rounded-lg shadow-lg max-w-md flex items-center gap-3`}>
                <span className="text-xl">{icons[type] || 'ℹ️'}</span>
                <span className="flex-1 text-sm">{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors ml-2"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}