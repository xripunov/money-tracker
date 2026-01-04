import { useState } from 'react';
import { expenseCategories, incomeCategories, accounts } from '../data/categories';

export default function QuickInput({ onAdd }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('food');
    const [transferDirection, setTransferDirection] = useState('toSavings'); // toSavings or toCurrent

    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    const handleNumpad = (value) => {
        if (value === 'delete') {
            setAmount((prev) => prev.slice(0, -1));
        } else if (value === '.') {
            if (!amount.includes('.')) {
                setAmount((prev) => prev + '.');
            }
        } else if (value === 'submit') {
            if (amount && parseFloat(amount) > 0) {
                if (type === 'transfer') {
                    onAdd({
                        type: 'transfer',
                        amount: parseFloat(amount),
                        category: 'transfer',
                        fromAccount: transferDirection === 'toSavings' ? 'current' : 'savings',
                        toAccount: transferDirection === 'toSavings' ? 'savings' : 'current',
                    });
                } else {
                    onAdd({
                        type,
                        amount: parseFloat(amount),
                        category,
                    });
                }
                setAmount('');
            }
        } else {
            const parts = amount.split('.');
            if (parts[1] && parts[1].length >= 2) return;
            setAmount((prev) => prev + value);
        }
    };

    const displayAmount = amount || '0';

    const getAmountPrefix = () => {
        if (type === 'expense') return '−';
        if (type === 'income') return '+';
        return '↔️';
    };

    return (
        <div className="quick-input">
            <div className="amount-display">
                <span className={`amount-value ${type}`}>
                    {getAmountPrefix()}
                    {parseFloat(displayAmount).toLocaleString('ru-RU')}
                </span>
                <span className="amount-currency">₽</span>
            </div>

            <div className="type-toggle three">
                <button
                    className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                    onClick={() => {
                        setType('expense');
                        setCategory('food');
                    }}
                >
                    Расход
                </button>
                <button
                    className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                    onClick={() => {
                        setType('income');
                        setCategory('salary');
                    }}
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
                <div className="transfer-section">
                    <div className="transfer-direction">
                        <button
                            className={`transfer-btn ${transferDirection === 'toSavings' ? 'active' : ''}`}
                            onClick={() => setTransferDirection('toSavings')}
                        >
                            <span className="transfer-icon">💳 → 🏦</span>
                            <span className="transfer-label">На накопления</span>
                        </button>
                        <button
                            className={`transfer-btn ${transferDirection === 'toCurrent' ? 'active' : ''}`}
                            onClick={() => setTransferDirection('toCurrent')}
                        >
                            <span className="transfer-icon">🏦 → 💳</span>
                            <span className="transfer-label">С накоплений</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="categories">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-btn ${category === cat.id ? 'active' : ''}`}
                            onClick={() => setCategory(cat.id)}
                        >
                            <span className="category-icon">{cat.icon}</span>
                            <span className="category-name">{cat.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="numpad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                    <button
                        key={num}
                        className="numpad-btn"
                        onClick={() => handleNumpad(String(num))}
                    >
                        {num}
                    </button>
                ))}
                <button
                    className="numpad-btn delete"
                    onClick={() => handleNumpad('delete')}
                >
                    ⌫
                </button>
                <button
                    className="numpad-btn submit"
                    onClick={() => handleNumpad('submit')}
                    style={{ gridColumn: 'span 3' }}
                >
                    {type === 'transfer' ? 'Перевести' : 'Добавить'}
                </button>
            </div>
        </div>
    );
}
