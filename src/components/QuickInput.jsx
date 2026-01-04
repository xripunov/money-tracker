import { useState, useCallback } from 'react';
import { getCategoryById } from '../data/categories';

export default function QuickInput({ onAdd }) {
    const [amount, setAmount] = useState('0');
    const [type, setType] = useState('expense'); // expense, income, transfer
    const [category, setCategory] = useState('food');
    const [isAnimating, setIsAnimating] = useState(false);

    // Transfer state
    // We assume default transfer is current -> savings. But user can confirm this.
    // For QuickInput, we might simplify: Left is Current, Right is Savings.
    // Let's assume generic Transfer: From Current to Savings by default.
    // Ideally, we'd have a selector. For now, let's keep it simple or infer it.
    // If 'transfer', we can show a direction toggle later. For MPV: Current -> Savings.
    const [transferDir, setTransferDir] = useState('to_savings'); // to_savings, to_current

    const { expenseCategories, incomeCategories } = require('../data/categories'); // Dynamic require or just import top level

    const currentCategories = type === 'expense'
        ? require('../data/categories').expenseCategories
        : require('../data/categories').incomeCategories;

    const handleNumClick = (num) => {
        setAmount((prev) => {
            if (prev === '0') return num;
            if (prev.includes('.') && num === '.') return prev;
            if (prev.length >= 9) return prev; // Limit length
            return prev + num;
        });
    };

    const handleDelete = () => {
        setAmount((prev) => {
            if (prev.length === 1) return '0';
            return prev.slice(0, -1);
        });
    };

    const handleSubmit = () => {
        const value = parseFloat(amount);
        if (value <= 0) return;

        const transaction = {
            type,
            amount: value,
            category: type === 'transfer' ? 'transfer' : category,
            date: new Date().toISOString(),
            // Add transfer specific fields
            ...(type === 'transfer' && {
                fromAccount: transferDir === 'to_savings' ? 'current' : 'savings',
                toAccount: transferDir === 'to_savings' ? 'savings' : 'current',
            })
        };

        onAdd(transaction);
        setAmount('0');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

        // Haptic feedback if available
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    };

    return (
        <div className="quick-input">
            <div className={`amount-display ${isAnimating ? 'pulse' : ''}`}>
                <input
                    type="text"
                    readOnly
                    value={type === 'expense' ? `−${amount} ₽` : (type === 'income' ? `+${amount} ₽` : `${amount} ₽`)}
                    className={`amount-input ${type}`}
                />
            </div>

            <div className="type-toggle">
                <button
                    className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                    onClick={() => setType('expense')}
                >
                    Расход
                </button>
                <button
                    className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                    onClick={() => setType('income')}
                >
                    Доход
                </button>
                <button
                    className={`type-btn transfer ${type === 'transfer' ? 'active' : ''}`}
                    onClick={() => setType('transfer')}
                >
                    Перевод
                </button>
            </div>

            {type === 'transfer' ? (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                        onClick={() => setTransferDir('to_savings')}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                            background: transferDir === 'to_savings' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)',
                            color: transferDir === 'to_savings' ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600
                        }}
                    >
                        На копилку ➡️
                    </button>
                    <button
                        onClick={() => setTransferDir('to_current')}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                            background: transferDir === 'to_current' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)',
                            color: transferDir === 'to_current' ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600
                        }}
                    >
                        ⬅️ С копилки
                    </button>
                </div>
            ) : (
                <div className="categories">
                    {currentCategories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-btn ${category === cat.id ? 'active' : ''}`}
                            onClick={() => setCategory(cat.id)}
                        >
                            <div className="category-icon">{cat.icon}</div>
                            <span className="category-name">{cat.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="numpad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                    <button
                        key={num}
                        className="num-btn"
                        onClick={() => handleNumClick(String(num))}
                    >
                        {num}
                    </button>
                ))}
                <button className="num-btn delete" onClick={handleDelete}>
                    ⌫
                </button>
                <button className="num-btn submit" onClick={handleSubmit}>
                    Добавить
                </button>
            </div>
        </div>
    );
}
