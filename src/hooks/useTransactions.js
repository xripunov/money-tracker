import { useState, useEffect, useCallback } from 'react';
import { saveToCloud, loadFromCloud, isTelegramEnv } from '../utils/telegramStorage';

export function useTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [initialBalances, setInitialBalances] = useState({ current: 0, savings: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [storageType, setStorageType] = useState('localStorage');

    // Load from storage on mount
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                // Load transactions
                const txData = await loadFromCloud('transactions');
                setTransactions(txData); // Ensure generic implementation returns array or appropriate default

                // Load initial balances
                const balancesData = await loadFromCloud('initial-balances');
                if (balancesData) {
                    setInitialBalances(balancesData);
                }

                setStorageType(isTelegramEnv() ? 'cloudStorage' : 'localStorage');
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Save transactions on change
    useEffect(() => {
        if (!isLoading && transactions.length >= 0) {
            saveToCloud(transactions, 'transactions').then((result) => {
                if (result?.source) {
                    setStorageType(result.source);
                }
            });
        }
    }, [transactions, isLoading]);

    // Save initial balances helper
    const updateInitialBalances = useCallback(async (newBalances) => {
        setInitialBalances(newBalances);
        await saveToCloud(newBalances, 'initial-balances');
    }, []);

    const addTransaction = useCallback((transaction) => {
        const newTransaction = {
            id: Date.now().toString(),
            date: transaction.date || new Date().toISOString(),
            ...transaction,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
        return newTransaction;
    }, []);

    const deleteTransaction = useCallback((id) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const updateTransaction = useCallback((updatedTransaction) => {
        setTransactions((prev) =>
            prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
        );
    }, []);

    const getTransactionsByPeriod = useCallback((period) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let startDate;
        switch (period) {
            case 'day':
                startDate = startOfDay;
                break;
            case 'week':
                startDate = new Date(startOfDay);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(startOfDay);
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                startDate = new Date(0);
        }

        return transactions.filter((t) => new Date(t.date) >= startDate);
    }, [transactions]);

    const getPreviousPeriodTransactions = useCallback((period) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let startDate, endDate;
        switch (period) {
            case 'day':
                endDate = startOfDay;
                startDate = new Date(startOfDay);
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                endDate = new Date(startOfDay);
                endDate.setDate(endDate.getDate() - 7);
                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                endDate = new Date(startOfDay);
                endDate.setMonth(endDate.getMonth() - 1);
                startDate = new Date(endDate);
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                return [];
        }

        return transactions.filter((t) => {
            const date = new Date(t.date);
            return date >= startDate && date < endDate;
        });
    }, [transactions]);

    const getStats = useCallback((period) => {
        const currentTransactions = getTransactionsByPeriod(period);
        const previousTransactions = getPreviousPeriodTransactions(period);

        const currentExpenses = currentTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const currentIncome = currentTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const previousExpenses = previousTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const previousIncome = previousTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenseChange = previousExpenses > 0
            ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
            : 0;

        const incomeChange = previousIncome > 0
            ? ((currentIncome - previousIncome) / previousIncome) * 100
            : 0;

        const categoryTotals = {};
        currentTransactions
            .filter((t) => t.type === 'expense')
            .forEach((t) => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });

        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percent: currentExpenses > 0 ? (amount / currentExpenses) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            expenses: currentExpenses,
            income: currentIncome,
            balance: currentIncome - currentExpenses,
            expenseChange,
            incomeChange,
            categoryBreakdown,
            transactionCount: currentTransactions.length,
        };
    }, [getTransactionsByPeriod, getPreviousPeriodTransactions]);

    const getTotalBalance = useCallback(() => {
        let current = initialBalances.current || 0;
        let savings = initialBalances.savings || 0;

        transactions.forEach((t) => {
            if (t.type === 'income') {
                current += t.amount;
            } else if (t.type === 'expense') {
                current -= t.amount;
            } else if (t.type === 'transfer') {
                if (t.fromAccount === 'current' && t.toAccount === 'savings') {
                    current -= t.amount;
                    savings += t.amount;
                } else if (t.fromAccount === 'savings' && t.toAccount === 'current') {
                    savings -= t.amount;
                    current += t.amount;
                }
            }
        });

        return { current, savings, total: current + savings };
    }, [transactions, initialBalances]);

    const groupByDate = useCallback((transactionList) => {
        const groups = {};
        transactionList.forEach((t) => {
            const dateKey = new Date(t.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
            });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(t);
        });
        return groups;
    }, []);

    return {
        transactions,
        isLoading,
        storageType,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        getTransactionsByPeriod,
        getStats,
        getTotalBalance,
        groupByDate,
        updateInitialBalances, // Export this new function
        initialBalances, // Export for UI if needed
    };
}
