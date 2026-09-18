import React, { useState, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
let addToastFn: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: 'success' | 'error' | 'info') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => { addToastFn = null; };
  }, []);

  const colors = {
    success: { bg: '#065f46', border: '#10b981', text: '#a7f3d0' },
    error: { bg: '#7f1d1d', border: '#ef4444', text: '#fecaca' },
    info: { bg: '#1e3a5f', border: '#3b82f6', text: '#bfdbfe' },
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 100000,
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '10px 16px',
            background: colors[toast.type].bg,
            border: `1px solid ${colors[toast.type].border}`,
            borderRadius: 6,
            color: colors[toast.type].text,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
