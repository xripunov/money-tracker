export default function AIAdvice({ advice, loading, error, onGenerate, isConfigured }) {
    if (!isConfigured) {
        return (
            <div className="ai-advice-card unconfigured">
                <div className="ai-advice-icon">🔑</div>
                <div className="ai-advice-title">ИИ-аналитика</div>
                <div className="ai-advice-text">
                    Добавьте VITE_GEMINI_API_KEY в .env файл для получения персональных советов
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="ai-advice-card loading">
                <div className="ai-advice-spinner"></div>
                <div className="ai-advice-title">Анализирую траты...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ai-advice-card error">
                <div className="ai-advice-icon">⚠️</div>
                <div className="ai-advice-title">Ошибка</div>
                <div className="ai-advice-text">{error}</div>
                <button className="ai-advice-btn" onClick={onGenerate}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (advice) {
        return (
            <div className="ai-advice-card">
                <div className="ai-advice-header">
                    <span className="ai-advice-icon">✨</span>
                    <span className="ai-advice-title">ИИ-советник</span>
                </div>
                <div className="ai-advice-content">
                    {advice.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
                <button className="ai-advice-btn secondary" onClick={onGenerate}>
                    Обновить анализ
                </button>
            </div>
        );
    }

    return (
        <div className="ai-advice-card">
            <div className="ai-advice-icon">🤖</div>
            <div className="ai-advice-title">ИИ-аналитика</div>
            <div className="ai-advice-text">
                Получите персональные советы по оптимизации расходов
            </div>
            <button className="ai-advice-btn" onClick={onGenerate}>
                ✨ Получить советы
            </button>
        </div>
    );
}
