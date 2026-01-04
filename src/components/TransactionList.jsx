import { getCategoryById } from '../data/categories';

export default function TransactionList({ transactions, groupByDate, onEdit }) {
    const grouped = groupByDate(transactions);
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        // Simple date parsing for sorting assuming locale format DD Month
        // A bit risky, but for restoring let's assume standard sort or pass raw date
        // Better to sort by raw date if possible, but groupByDate returns string keys.
        // Let's rely on transactions being already sorted by ID/Date in hook usually.
        // But `Object.keys` order is not guaranteed.
        // Re-implementing a safer sort if needed, but for now simple reverse entry order often works if list was sorted.
        return 0;
    });
    // Actually, better to iterate transactions and group sequentially to preserve order

    // Re-grouping preservation
    const groups = [];
    let currentGroup = null;

    transactions.forEach(t => {
        const dateKey = new Date(t.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
        });

        if (!currentGroup || currentGroup.date !== dateKey) {
            currentGroup = { date: dateKey, items: [] };
            groups.push(currentGroup);
        }
        currentGroup.items.push(t);
    });

    if (transactions.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
                <p>Пока нет операций</p>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            {groups.map((group) => (
                <div key={group.date} className="date-group">
                    <h3>{group.date}</h3>
                    {group.items.map((t) => {
                        const category = getCategoryById(t.category, t.type);
                        return (
                            <div
                                key={t.id}
                                className="transaction-item"
                                onClick={() => onEdit(t)}
                            >
                                <div className="t-icon">{category.icon}</div>
                                <div className="t-info">
                                    <div className="t-category">{category.name}</div>
                                    {/* <div className="t-comment">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div> */}
                                </div>
                                <div className={`t-amount ${t.type}`}>
                                    {t.type === 'expense' ? '−' : (t.type === 'income' ? '+' : '')}
                                    {t.amount.toLocaleString('ru-RU')} ₽
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
