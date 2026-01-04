import { useState, useMemo } from 'react';

export default function Savings({ transactions, getTotalBalance }) {
    const [goal, setGoal] = useState(() => {
        const saved = localStorage.getItem('savings-goal');
        return saved ? parseFloat(saved) : 100000;
    });
    const [showGoalInput, setShowGoalInput] = useState(false);

    const balances = getTotalBalance();

    // Calculate savings stats
    const savingsStats = useMemo(() => {
        const transfers = transactions.filter(t => t.type === 'transfer');

        // Monthly savings (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransfers = transfers.filter(t => new Date(t.date) >= thirtyDaysAgo);

        const monthlyIn = recentTransfers
            .filter(t => t.toAccount === 'savings')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyOut = recentTransfers
            .filter(t => t.fromAccount === 'savings')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyNet = monthlyIn - monthlyOut;

        // Average monthly savings rate
        const allMonths = {};
        transfers.forEach(t => {
            const monthKey = new Date(t.date).toISOString().slice(0, 7);
            if (!allMonths[monthKey]) allMonths[monthKey] = 0;
            if (t.toAccount === 'savings') allMonths[monthKey] += t.amount;
            if (t.fromAccount === 'savings') allMonths[monthKey] -= t.amount;
        });

        const monthlyAmounts = Object.values(allMonths);
        const avgMonthly = monthlyAmounts.length > 0
            ? monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length
            : 0;

        // Time to goal
        const remaining = goal - balances.savings;
        const monthsToGoal = avgMonthly > 0 ? Math.ceil(remaining / avgMonthly) : null;

        return {
            monthlyIn,
            monthlyOut,
            monthlyNet,
            avgMonthly,
            monthsToGoal,
            progress: goal > 0 ? (balances.savings / goal) * 100 : 0,
        };
    }, [transactions, balances.savings, goal]);

    const handleGoalSave = (newGoal) => {
        const value = parseFloat(newGoal) || 0;
        setGoal(value);
        localStorage.setItem('savings-goal', String(value));
        setShowGoalInput(false);
    };

    const formatMonths = (months) => {
        if (!months || months <= 0) return '—';
        if (months === 1) return '1 месяц';
        if (months < 5) return `${months} месяца`;
        return `${months} месяцев`;
    };

    return (
        <div className="savings-page">
            {/* Goal Progress */}
            <div className="savings-goal-card">
                <div className="goal-header">
                    <span className="goal-title">🎯 Цель накоплений</span>
                    <button
                        className="goal-edit-btn"
                        onClick={() => setShowGoalInput(!showGoalInput)}
                    >
                        ✏️
                    </button>
                </div>

                {showGoalInput ? (
                    <div className="goal-input-row">
                        <input
                            type="number"
                            defaultValue={goal}
                            className="goal-input"
                            placeholder="Введите цель"
                            onBlur={(e) => handleGoalSave(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGoalSave(e.target.value)}
                            autoFocus
                        />
                        <span className="goal-currency">₽</span>
                    </div>
                ) : (
                    <div className="goal-amount">
                        {balances.savings.toLocaleString('ru-RU')} / {goal.toLocaleString('ru-RU')} ₽
                    </div>
                )}

                <div className="goal-progress-bar">
                    <div
                        className="goal-progress-fill"
                        style={{ width: `${Math.min(savingsStats.progress, 100)}%` }}
                    />
                </div>
                <div className="goal-progress-text">
                    {savingsStats.progress.toFixed(0)}% достигнуто
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="savings-stats-grid">
                <div className="savings-stat-card">
                    <div className="stat-icon">📥</div>
                    <div className="stat-info">
                        <span className="stat-label">Отложено за месяц</span>
                        <span className="stat-value positive">
                            +{savingsStats.monthlyIn.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                </div>

                <div className="savings-stat-card">
                    <div className="stat-icon">📤</div>
                    <div className="stat-info">
                        <span className="stat-label">Снято за месяц</span>
                        <span className="stat-value negative">
                            −{savingsStats.monthlyOut.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                </div>
            </div>

            {/* Forecast */}
            <div className="savings-forecast-card">
                <div className="forecast-title">📈 Прогноз</div>
                <div className="forecast-content">
                    {savingsStats.avgMonthly > 0 ? (
                        <>
                            <div className="forecast-row">
                                <span>Среднее в месяц:</span>
                                <span className="forecast-value">
                                    {savingsStats.avgMonthly > 0 ? '+' : ''}{savingsStats.avgMonthly.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                            {savingsStats.monthsToGoal && savingsStats.monthsToGoal > 0 && (
                                <div className="forecast-row">
                                    <span>До цели:</span>
                                    <span className="forecast-value highlight">
                                        {formatMonths(savingsStats.monthsToGoal)}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="forecast-empty">
                            Начните откладывать деньги, чтобы увидеть прогноз
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transfers */}
            <div className="savings-history">
                <div className="history-title">История переводов</div>
                {transactions
                    .filter(t => t.type === 'transfer')
                    .slice(0, 5)
                    .map(t => (
                        <div key={t.id} className="transfer-item">
                            <span className="transfer-item-icon">
                                {t.toAccount === 'savings' ? '📥' : '📤'}
                            </span>
                            <div className="transfer-item-info">
                                <span className="transfer-item-label">
                                    {t.toAccount === 'savings' ? 'На накопления' : 'С накоплений'}
                                </span>
                                <span className="transfer-item-date">
                                    {new Date(t.date).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                            <span className={`transfer-item-amount ${t.toAccount === 'savings' ? 'positive' : 'negative'}`}>
                                {t.toAccount === 'savings' ? '+' : '−'}{t.amount.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                    ))}
                {transactions.filter(t => t.type === 'transfer').length === 0 && (
                    <div className="transfer-empty">
                        Пока нет переводов
                    </div>
                )}
            </div>
        </div>
    );
}
