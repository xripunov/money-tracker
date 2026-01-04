import { useState, useEffect, useMemo } from 'react';
import { getCategoryById } from '../data/categories';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import AIAdvice from './AIAdvice';

export default function Statistics({ getStats, transactions }) {
    const [viewMode, setViewMode] = useState('relative'); // 'relative' or 'month'
    const [period, setPeriod] = useState('week');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const { loading, advice, error, generateAdvice, clearAdvice, isConfigured } = useAIAnalysis();

    // Get available months from transactions
    const availableMonths = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const months = new Set();
        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(key);
        });

        return Array.from(months).sort().reverse();
    }, [transactions]);

    // Calculate stats for a specific month
    const monthStats = useMemo(() => {
        if (!transactions || viewMode !== 'month') return null;

        const [year, month] = selectedMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);

        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd;
        });

        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const categoryTotals = {};
        monthTransactions
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

        return {
            expenses,
            income,
            balance: income - expenses,
            categoryBreakdown,
            transactionCount: monthTransactions.length,
        };
    }, [transactions, selectedMonth, viewMode]);

    const stats = viewMode === 'month' ? monthStats : getStats(period);

    useEffect(() => {
        clearAdvice();
    }, [period, selectedMonth, viewMode, clearAdvice]);

    const periodLabels = {
        day: 'День',
        week: 'Неделя',
        month: 'Месяц',
    };

    const formatMonthLabel = (monthKey) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    };

    const navigateMonth = (direction) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + direction);
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatChange = (change) => {
        if (!change || change === 0) return null;
        const isUp = change > 0;
        return (
            <span className={`stats-card-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
            </span>
        );
    };

    const handleGenerateAdvice = () => {
        generateAdvice(stats, viewMode === 'month' ? 'month' : period);
    };

    if (!stats) return null;

    return (
        <div className="stats-page">
            {/* View mode toggle */}
            <div className="view-mode-toggle">
                <button
                    className={`view-mode-btn ${viewMode === 'relative' ? 'active' : ''}`}
                    onClick={() => setViewMode('relative')}
                >
                    Период
                </button>
                <button
                    className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                >
                    По месяцам
                </button>
            </div>

            {viewMode === 'relative' ? (
                <div className="period-selector">
                    {Object.entries(periodLabels).map(([key, label]) => (
                        <button
                            key={key}
                            className={`period-btn ${period === key ? 'active' : ''}`}
                            onClick={() => setPeriod(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="month-navigator">
                    <button className="month-nav-btn" onClick={() => navigateMonth(-1)}>
                        ←
                    </button>
                    <span className="month-label">{formatMonthLabel(selectedMonth)}</span>
                    <button className="month-nav-btn" onClick={() => navigateMonth(1)}>
                        →
                    </button>
                </div>
            )}

            <AIAdvice
                advice={advice}
                loading={loading}
                error={error}
                onGenerate={handleGenerateAdvice}
                isConfigured={isConfigured}
            />

            <div className="stats-card">
                <div className="stats-card-title">
                    Расходы {viewMode === 'month' ? '' : `за ${periodLabels[period].toLowerCase()}`}
                </div>
                <div className="stats-card-value" style={{ color: 'var(--danger)' }}>
                    {stats.expenses.toLocaleString('ru-RU')} ₽
                </div>
                {viewMode === 'relative' && formatChange(stats.expenseChange)}
            </div>

            <div className="stats-card">
                <div className="stats-card-title">
                    Доходы {viewMode === 'month' ? '' : `за ${periodLabels[period].toLowerCase()}`}
                </div>
                <div className="stats-card-value" style={{ color: 'var(--success)' }}>
                    {stats.income.toLocaleString('ru-RU')} ₽
                </div>
                {viewMode === 'relative' && formatChange(-stats.incomeChange)}
            </div>

            <div className="stats-card">
                <div className="stats-card-title">
                    Баланс {viewMode === 'month' ? '' : `за ${periodLabels[period].toLowerCase()}`}
                </div>
                <div
                    className="stats-card-value"
                    style={{ color: stats.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}
                >
                    {stats.balance >= 0 ? '+' : ''}{stats.balance.toLocaleString('ru-RU')} ₽
                </div>
            </div>

            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
                <div className="stats-card">
                    <div className="stats-card-title">Расходы по категориям</div>
                    <div className="category-breakdown">
                        {stats.categoryBreakdown.map((item) => {
                            const category = getCategoryById(item.category, 'expense');
                            return (
                                <div key={item.category} className="category-row">
                                    <span className="category-row-icon">{category.icon}</span>
                                    <div className="category-row-info">
                                        <div className="category-row-name">{category.name}</div>
                                        <div className="category-row-bar">
                                            <div
                                                className="category-row-bar-fill"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="category-row-amount">
                                        <div className="category-row-value">
                                            {item.amount.toLocaleString('ru-RU')} ₽
                                        </div>
                                        <div className="category-row-percent">
                                            {item.percent.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {stats.transactionCount === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <div className="empty-title">Нет данных</div>
                    <div className="empty-text">За этот период нет транзакций</div>
                </div>
            )}
        </div>
    );
}
