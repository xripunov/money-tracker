import { useState, useEffect } from 'react';
import { isTelegramEnv } from '../utils/telegramStorage';

export default function BalanceSetupModal({ initialBalances, onSave, onClose, storageType }) {
    const [current, setCurrent] = useState('');
    const [savings, setSavings] = useState('');
    const [debugInfo, setDebugInfo] = useState({
        storage: 'Loading...',
        telegram: 'Checking...',
        platform: 'Loading...',
        userId: 'Loading...'
    });

    useEffect(() => {
        // Use passed initialBalances prop if available, otherwise try to load from local (though prop is preferred)
        if (initialBalances) {
            setCurrent(String(initialBalances.current || 0));
            setSavings(String(initialBalances.savings || 0));
        } else {
            // Fallback
            const saved = localStorage.getItem('initial-balances');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCurrent(String(parsed.current || 0));
                    setSavings(String(parsed.savings || 0));
                } catch (e) {
                    console.error("Error parsing initial balances", e);
                }
            }
        }

        // Safely gather debug info
        try {
            const isTG = isTelegramEnv();
            const platform = window.Telegram?.WebApp?.platform || 'Unknown';
            const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'Unknown';

            setDebugInfo({
                storage: storageType === 'cloudStorage' ? '☁️ Cloud' : '💾 Local',
                telegram: isTG ? '✅ Detected' : '❌ Not Detected',
                platform: platform,
                userId: String(userId)
            });
        } catch (e) {
            console.error("Error gathering debug info", e);
            setDebugInfo({
                storage: 'Error',
                telegram: 'Error',
                platform: 'Error',
                userId: 'Error'
            });
        }
    }, [initialBalances, storageType]);

    const handleSave = () => {
        const newBalances = {
            current: parseFloat(current) || 0,
            savings: parseFloat(savings) || 0,
        };
        // Don't save to localStorage manually here, rely on the onSave callback which will call updateInitialBalances
        onSave(newBalances);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ Начальные балансы</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <p className="setup-hint">
                    Укажите, сколько денег у вас уже есть на счетах
                </p>

                <div className="setup-field">
                    <label className="setup-label">
                        <span className="setup-icon">💳</span>
                        Текущий счёт
                    </label>
                    <div className="setup-input-row">
                        <input
                            type="number"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            className="setup-input"
                            placeholder="0"
                        />
                        <span className="setup-currency">₽</span>
                    </div>
                </div>

                <div className="setup-field">
                    <label className="setup-label">
                        <span className="setup-icon">🏦</span>
                        Накопления
                    </label>
                    <div className="setup-input-row">
                        <input
                            type="number"
                            value={savings}
                            onChange={(e) => setSavings(e.target.value)}
                            className="setup-input"
                            placeholder="0"
                        />
                        <span className="setup-currency">₽</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="modal-btn save" onClick={handleSave}>
                        ✓ Сохранить
                    </button>
                </div>

                <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px', color: '#888' }}>
                    <div style={{ marginBottom: '4px' }}>📡 <strong>Sync Status:</strong></div>
                    <div>Storage: {debugInfo.storage}</div>
                    <div>Telegram API: {debugInfo.telegram}</div>
                    <div>Platform: {debugInfo.platform}</div>
                    <div>User ID: {debugInfo.userId}</div>
                </div>
            </div>
        </div>
    );
}
