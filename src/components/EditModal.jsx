import { useState, useEffect } from 'react';
import { expenseCategories, incomeCategories, getCategoryById } from '../data/categories';

export default function EditModal({ transaction, onSave, onDelete, onClose }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('food');

    useEffect(() => {
        if (transaction) {
            setAmount(String(transaction.amount));
            setType(transaction.type);
            setCategory(transaction.category);
        }
    }, [transaction]);

    if (!transaction) return null;

    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    const transactionDate = new Date(transaction.date);
    const formattedDate = transactionDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
    });
    const formattedTime = transactionDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleSave = () => {
        if (amount && parseFloat(amount) > 0) {
            onSave({
                ...transaction,
                type,
                amount: parseFloat(amount),
                category,
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Удалить транзакцию?')) {
            onDelete(transaction.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Редактировать</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-meta">
                    🕐 {formattedDate}, {formattedTime}
                </div>

                <div className="modal-amount">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="amount-input"
                        placeholder="0"
                    />
                    <span className="amount-currency">₽</span>
                </div>

                <div className="type-toggle">
                    <button
                        className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                        onClick={() => {
                            setType('expense');
                            if (!expenseCategories.find((c) => c.id === category)) {
                                setCategory('food');
                            }
                        }}
                    >
                        Расход
                    </button>
                    <button
                        className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                        onClick={() => {
                            setType('income');
                            if (!incomeCategories.find((c) => c.id === category)) {
                                setCategory('salary');
                            }
                        }}
                    >
                        Доход
                    </button>
                </div>

                <div className="categories modal-categories">
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

                <div className="modal-actions">
                    <button className="modal-btn delete" onClick={handleDelete}>
                        🗑️ Удалить
                    </button>
                    <button className="modal-btn save" onClick={handleSave}>
                        ✓ Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}
