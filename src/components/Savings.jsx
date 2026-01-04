import { useState } from 'react';

export default function Savings({ transactions, getTotalBalance }) {
    // For now, goal is hardcoded or stored locally.
    // Let's implement a simple goal setting in UI if we want, or just static for MVP restoration.
    // User requested "Копилка с целью и прогнозом" previously.
    // I will implementation basic visualization based on available data.

    const [goal, setGoal] = useState(() => {
        return parseFloat(localStorage.getItem('savings_goal')) || 100000;
    });

    const balances = getTotalBalance();
    const currentAmount = balances.savings;
    const progress = Math.min((currentAmount / goal) * 100, 100);

    // Calculate monthly savings rate
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthSavings = transactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'transfer' && t.toAccount === 'savings';
        })
        .reduce((sum, t) => sum + t.amount, 0);

    // Simple forecast
    const remaining = Math.max(goal - currentAmount, 0);
    const monthsToGoal = thisMonthSavings > 0 ? Math.ceil(remaining / thisMonthSavings) : Infinity;

    return (
        <div className="savings-page">
            <div className="savings-goal">
                <div className="goal-circle">
                    <span className="goal-percent">{Math.round(progress)}%</span>
                    <span className="goal-label">от цели</span>
                </div>

                <h2 style={{ marginBottom: '8px' }}>
                    {currentAmount.toLocaleString('ru-RU')} / {goal.toLocaleString('ru-RU')} ₽
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Накоплено
                </div>
            </div>

            <div className="stat-card" style={{ marginBottom: '12px' }}>
                <div className="stat-label">Отложено в этом месяце</div>
                <div className="stat-value income">+{thisMonthSavings.toLocaleString('ru-RU')} ₽</div>
            </div>

            {thisMonthSavings > 0 && remaining > 0 && (
                <div className="stat-card">
                    <div className="stat-label">Прогноз</div>
                    <div className="stat-value">
                        {monthsToGoal} мес.
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        до цели при таком темпе
                    </div>
                </div>
            )}
        </div>
    );
}
