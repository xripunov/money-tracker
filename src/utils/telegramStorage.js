// Telegram CloudStorage API wrapper
// Works only inside Telegram Mini App environment

const isTelegramAvailable = () => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage;
};

const STORAGE_KEY = 'transactions';

export async function saveToCloud(transactions) {
    if (!isTelegramAvailable()) {
        // Fallback to localStorage
        localStorage.setItem('money-counter-transactions', JSON.stringify(transactions));
        return { success: true, source: 'localStorage' };
    }

    return new Promise((resolve) => {
        const data = JSON.stringify(transactions);

        // Telegram CloudStorage has 1MB limit, so we might need to chunk
        if (data.length > 4096) {
            // Split into chunks
            const chunks = [];
            for (let i = 0; i < data.length; i += 4096) {
                chunks.push(data.slice(i, i + 4096));
            }

            const keys = {};
            chunks.forEach((chunk, i) => {
                keys[`${STORAGE_KEY}_${i}`] = chunk;
            });
            keys[`${STORAGE_KEY}_count`] = String(chunks.length);

            window.Telegram.WebApp.CloudStorage.setItems(keys, (error) => {
                if (error) {
                    console.error('CloudStorage save error:', error);
                    // Fallback to localStorage
                    localStorage.setItem('money-counter-transactions', JSON.stringify(transactions));
                    resolve({ success: true, source: 'localStorage' });
                } else {
                    resolve({ success: true, source: 'cloudStorage' });
                }
            });
        } else {
            window.Telegram.WebApp.CloudStorage.setItem(STORAGE_KEY, data, (error) => {
                if (error) {
                    console.error('CloudStorage save error:', error);
                    localStorage.setItem('money-counter-transactions', JSON.stringify(transactions));
                    resolve({ success: true, source: 'localStorage' });
                } else {
                    resolve({ success: true, source: 'cloudStorage' });
                }
            });
        }
    });
}

export async function loadFromCloud() {
    if (!isTelegramAvailable()) {
        // Fallback to localStorage
        const stored = localStorage.getItem('money-counter-transactions');
        return stored ? JSON.parse(stored) : [];
    }

    return new Promise((resolve) => {
        // First check if we have chunked data
        window.Telegram.WebApp.CloudStorage.getItem(`${STORAGE_KEY}_count`, (error, countStr) => {
            if (error || !countStr) {
                // Try single key
                window.Telegram.WebApp.CloudStorage.getItem(STORAGE_KEY, (err, data) => {
                    if (err || !data) {
                        // Fallback to localStorage
                        const stored = localStorage.getItem('money-counter-transactions');
                        resolve(stored ? JSON.parse(stored) : []);
                    } else {
                        resolve(JSON.parse(data));
                    }
                });
            } else {
                // Load chunks
                const count = parseInt(countStr, 10);
                const keys = [];
                for (let i = 0; i < count; i++) {
                    keys.push(`${STORAGE_KEY}_${i}`);
                }

                window.Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
                    if (err) {
                        const stored = localStorage.getItem('money-counter-transactions');
                        resolve(stored ? JSON.parse(stored) : []);
                    } else {
                        const combined = keys.map((k) => values[k] || '').join('');
                        resolve(combined ? JSON.parse(combined) : []);
                    }
                });
            }
        });
    });
}

export function isTelegramEnv() {
    return isTelegramAvailable();
}
