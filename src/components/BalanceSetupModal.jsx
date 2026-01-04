import { useState, useEffect } from 'react';
import { isTelegramEnv } from '../utils/telegramStorage';

export default function BalanceSetupModal({ initialBalances, onSave, onClose, storageType }) {
    const [current, setCurrent] = useState('');
    const [savings, setSavings] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('initial-balances');
        if (saved) {
            const parsed = JSON.parse(saved);
            setCurrent(String(parsed.current || 0));
            setSavings(String(parsed.savings || 0));
        }
    }, []);

    const handleSave = () => {
        const newBalances = {
            current: parseFloat(current) || 0,
            savings: parseFloat(savings) || 0,
        };
        localStorage.setItem('initial-balances', JSON.stringify(newBalances));
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

                <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '12px', color: '#888' }}>
                    <div style={{ marginBottom: '4px' }}>📡 <strong>Sync Status:</strong></div>
                    <div>Storage: {storageType === 'cloudStorage' ? '☁️ Cloud' : '💾 Local'}</div>
                    <div>Telegram API: {isTelegramEnv() ? '✅ Detected' : '❌ Not Detected'}</div>
                    <div>Platform: {window.Telegram?.WebApp?.platform || 'Unknown'}</div>
                    <div>User ID: {window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'Unknown'}</div>
                </div>
            </div>
        </div>
    );
}
