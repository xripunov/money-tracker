import { useState, useMemo } from 'react';
import { expenseCategories, incomeCategories, getCategoryById } from '../data/categories';

export default function Statistics({ getStats, transactions }) {
    const [viewMode, setViewMode] = useState('relative'); // 'relative' or 'month'
    const [period, setPeriod] = useState('month'); // day, week, month (for relative)
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const stats = useMemo(() => getStats(period), [getStats, period, transactions]);

    // Specific month stats
    const monthStats = useMemo(() => {
        if (viewMode !== 'month') return null;

        const [year, month] = selectedMonth.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        const expenses = filtered
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const income = filtered
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const categoryTotals = {};
        filtered
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });

        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percent: expenses > 0 ? (amount / expenses) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        return { expenses, income, categoryBreakdown };
    }, [transactions, selectedMonth, viewMode]);

    const currentStats = viewMode === 'relative' ? stats : monthStats;

    const navigateMonth = (direction) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + direction, 1);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonth = (isoMonth) => {
        const [year, month] = isoMonth.split('-').map(Number);
        return new Date(year, month - 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="statistics">
            <div className="stats-header">
                <h2>Статистика</h2>

                <div className="view-toggle" style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px', marginBottom: '12px' }}>
                    <button
                        onClick={() => setViewMode('relative')}
                        style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', background: viewMode === 'relative' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'relative' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                        Период
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', background: viewMode === 'month' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                        Месяц
                    </button>
                </div>

                {viewMode === 'relative' ? (
                    <div className="period-toggle">
                        <button
                            className={`period-btn ${period === 'day' ? 'active' : ''}`}
                            onClick={() => setPeriod('day')}
                        >
                            День
                        </button>
                        <button
                            className={`period-btn ${period === 'week' ? 'active' : ''}`}
                            onClick={() => setPeriod('week')}
                        >
                            Неделя
                        </button>
                        <button
                            className={`period-btn ${period === 'month' ? 'active' : ''}`}
                            onClick={() => setPeriod('month')}
                        >
                            Месяц
                        </button>
                    </div>
                ) : (
                    <div className="month-nav">
                        <button className="nav-arrow" onClick={() => navigateMonth(-1)}>←</button>
                        <span className="current-month" style={{ textTransform: 'capitalize' }}>{formatMonth(selectedMonth)}</span>
                        <button className="nav-arrow" onClick={() => navigateMonth(1)}>→</button>
                    </div>
                )}
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-label">Расходы</div>
                    <div className="stat-value expense">
                        {Math.round(currentStats.expenses).toLocaleString('ru-RU')} ₽
                    </div>
                    {viewMode === 'relative' && (
                        <div style={{ fontSize: '12px', color: stats.expenseChange > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {stats.expenseChange > 0 ? '+' : ''}{Math.round(stats.expenseChange)}%
                        </div>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-label">Доходы</div>
                    <div className="stat-value income">
                        {Math.round(currentStats.income).toLocaleString('ru-RU')} ₽
                    </div>
                    {viewMode === 'relative' && (
                        <div style={{ fontSize: '12px', color: stats.incomeChange > 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {stats.incomeChange > 0 ? '+' : ''}{Math.round(stats.incomeChange)}%
                        </div>
                    )}
                </div>
            </div>

            <div className="category-stats">
                <h3>По категориям</h3>
                {currentStats.categoryBreakdown.map((item) => {
                    const cat = getCategoryById(item.category);
                    return (
                        <div key={item.category} className="cat-stat-item">
                            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '14px' }}>{cat.name}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                        {Math.round(item.amount).toLocaleString('ru-RU')} ₽
                                    </span>
                                </div>
                                <div className="cat-progress">
                                    <div
                                        className="cat-bar"
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {currentStats.categoryBreakdown.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                        Нет расходов за этот период
                    </div>
                )}
            </div>
        </div>
    );
}
