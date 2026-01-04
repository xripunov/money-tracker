import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import QuickInput from './components/QuickInput';
import TransactionList from './components/TransactionList';
import Statistics from './components/Statistics';
import Savings from './components/Savings';
import EditModal from './components/EditModal';
import BalanceSetupModal from './components/BalanceSetupModal';
import './index.css';

function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showBalanceSetup, setShowBalanceSetup] = useState(false);
    const {
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        getStats,
        getTotalBalance,
        groupByDate,
        updateInitialBalances,
        initialBalances,
        storageType,
    } = useTransactions();

    const balances = getTotalBalance();

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
    };

    const handleSave = (updatedTransaction) => {
        updateTransaction(updatedTransaction);
        setEditingTransaction(null);
    };

    const handleDelete = (id) => {
        deleteTransaction(id);
        setEditingTransaction(null);
    };

    const handleBalanceSave = (newBalances) => {
        updateInitialBalances(newBalances);
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-top">
                    <h1>💰 Финансы</h1>
                    <button
                        className="settings-btn"
                        onClick={() => setShowBalanceSetup(true)}
                    >
                        ⚙️
                    </button>
                </div>
                <div className="balances">
                    <div className="balance-item" onClick={() => setShowBalanceSetup(true)}>
                        <span className="balance-icon">💳</span>
                        <div className="balance-info">
                            <span className="balance-label">Текущий</span>
                            <span className={`balance-value ${balances.current >= 0 ? 'positive' : 'negative'}`}>
                                {balances.current.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                    </div>
                    <div className="balance-item" onClick={() => setShowBalanceSetup(true)}>
                        <span className="balance-icon">🏦</span>
                        <div className="balance-info">
                            <span className="balance-label">Накопления</span>
                            <span className="balance-value positive">
                                {balances.savings.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                {activeTab === 'home' && (
                    <>
                        <QuickInput onAdd={addTransaction} />
                        <TransactionList
                            transactions={transactions.slice(0, 10)}
                            groupByDate={groupByDate}
                            onEdit={handleEdit}
                        />
                    </>
                )}

                {activeTab === 'history' && (
                    <TransactionList
                        transactions={transactions}
                        groupByDate={groupByDate}
                        onEdit={handleEdit}
                    />
                )}

                {activeTab === 'savings' && (
                    <Savings
                        transactions={transactions}
                        getTotalBalance={getTotalBalance}
                    />
                )}

                {activeTab === 'stats' && (
                    <Statistics getStats={getStats} transactions={transactions} />
                )}
            </main>

            <nav className="bottom-nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    <span className="nav-icon">➕</span>
                    <span>Добавить</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <span className="nav-icon">📋</span>
                    <span>История</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'savings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('savings')}
                >
                    <span className="nav-icon">🏦</span>
                    <span>Копилка</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <span className="nav-icon">📊</span>
                    <span>Статистика</span>
                </button>
            </nav>

            {editingTransaction && (
                <EditModal
                    transaction={editingTransaction}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setEditingTransaction(null)}
                />
            )}

            {showBalanceSetup && (
                <BalanceSetupModal
                    initialBalances={initialBalances}
                    onSave={handleBalanceSave}
                    onClose={() => setShowBalanceSetup(false)}
                    storageType={storageType}
                />
            )}
        </div>
    );
}

export default App;
