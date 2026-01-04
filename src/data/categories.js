export const expenseCategories = [
    { id: 'food', name: 'Еда', icon: '🍔' },
    { id: 'transport', name: 'Транспорт', icon: '🚕' },
    { id: 'shopping', name: 'Покупки', icon: '🛍️' },
    { id: 'girlfriend', name: 'Девушка', icon: '💕' },
    { id: 'entertainment', name: 'Развлечения', icon: '🎬' },
    { id: 'health', name: 'Здоровье', icon: '💊' },
    { id: 'home', name: 'Дом', icon: '🏠' },
    { id: 'rent', name: 'Аренда', icon: '🔑' },
    { id: 'credits', name: 'Кредиты', icon: '🏦' },
    { id: 'subscriptions', name: 'Подписки', icon: '📱' },
    { id: 'other', name: 'Другое', icon: '📦' },
];

export const incomeCategories = [
    { id: 'salary', name: 'Зарплата', icon: '💰' },
    { id: 'freelance', name: 'Фриланс', icon: '💻' },
    { id: 'gift', name: 'Подарок', icon: '🎁' },
    { id: 'investment', name: 'Инвестиции', icon: '📈' },
    { id: 'refund', name: 'Возврат', icon: '↩️' },
    { id: 'other', name: 'Другое', icon: '💵' },
];

// Accounts
export const accounts = [
    { id: 'current', name: 'Текущий', icon: '💳' },
    { id: 'savings', name: 'Накопления', icon: '🏦' },
];

export function getCategoryById(id, type = 'expense') {
    if (type === 'transfer') {
        return { id: 'transfer', name: 'Перевод', icon: '↔️' };
    }
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    return categories.find((c) => c.id === id) || { id: 'other', name: 'Другое', icon: '📦' };
}

export function getAccountById(id) {
    return accounts.find((a) => a.id === id) || accounts[0];
}
