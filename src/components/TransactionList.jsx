import { getCategoryById } from '../data/categories';

export default function TransactionList({ transactions, groupByDate, onEdit }) {
    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <div className="empty-title">Пока нет транзакций</div>
                <div className="empty-text">Добавьте первый расход или доход</div>
            </div>
        );
    }

    const grouped = groupByDate(transactions);

    return (
        <div className="transactions-section">
            <div className="section-header">
                <span className="section-title">История</span>
            </div>

            {Object.entries(grouped).map(([date, items]) => {
                const dayTotal = items.reduce((sum, t) => {
                    return t.type === 'income' ? sum + t.amount : sum - t.amount;
                }, 0);

                return (
                    <div key={date} className="day-group">
                        <div className="day-header">
                            <span className="day-date">{date}</span>
                            <span
                                className="day-total"
                                style={{ color: dayTotal >= 0 ? 'var(--success)' : 'var(--danger)' }}
                            >
                                {dayTotal >= 0 ? '+' : ''}{dayTotal.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>

                        {items.map((transaction) => {
                            const category = getCategoryById(transaction.category, transaction.type);
                            const time = new Date(transaction.date).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={transaction.id}
                                    className="transaction-item"
                                    onClick={() => onEdit(transaction)}
                                >
                                    <div className="transaction-icon">{category.icon}</div>
                                    <div className="transaction-details">
                                        <div className="transaction-category">{category.name}</div>
                                        <div className="transaction-time">{time}</div>
                                    </div>
                                    <div className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'expense' ? '−' : '+'}
                                        {transaction.amount.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
