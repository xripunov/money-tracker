// Telegram CloudStorage API wrapper
// Works only inside Telegram Mini App environment

const isTelegramAvailable = () => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage;
};

export async function saveToCloud(data, key = 'transactions') {
    if (!isTelegramAvailable()) {
        localStorage.setItem(`money-counter-${key}`, JSON.stringify(data));
        return { success: true, source: 'localStorage' };
    }

    return new Promise((resolve) => {
        const dataStr = JSON.stringify(data);

        // Telegram CloudStorage has 1MB limit check (generic logic)
        // For simple keys like 'initial-balances', it won't be huge.
        // For 'transactions', we kept the chunking logic.

        if (key === 'transactions' && dataStr.length > 4096) {
            // Chunking logic strictly for 'transactions' for now, or generic if needed.
            // Let's keep the existing chunking logic but applied to the specific key prefix if needed.
            // For simplicity in restoration, and since balances are small, I'll implement simple setItem for standard keys
            // and kept the chunking logic specific to transactions if I recall it correctly, 
            // but let's make it generic for the key.

            const chunks = [];
            for (let i = 0; i < dataStr.length; i += 4096) {
                chunks.push(dataStr.slice(i, i + 4096));
            }

            const keys = {};
            chunks.forEach((chunk, i) => {
                keys[`${key}_${i}`] = chunk;
            });
            keys[`${key}_count`] = String(chunks.length);

            window.Telegram.WebApp.CloudStorage.setItems(keys, (error) => {
                if (error) {
                    console.error('CloudStorage save error:', error);
                    localStorage.setItem(`money-counter-${key}`, dataStr);
                    resolve({ success: true, source: 'localStorage' });
                } else {
                    resolve({ success: true, source: 'cloudStorage' });
                }
            });
        } else {
            window.Telegram.WebApp.CloudStorage.setItem(key, dataStr, (error) => {
                if (error) {
                    console.error('CloudStorage save error:', error);
                    localStorage.setItem(`money-counter-${key}`, dataStr);
                    resolve({ success: true, source: 'localStorage' });
                } else {
                    resolve({ success: true, source: 'cloudStorage' });
                }
            });
        }
    });
}

export async function loadFromCloud(key = 'transactions') {
    if (!isTelegramAvailable()) {
        const stored = localStorage.getItem(`money-counter-${key}`);
        // Legacy fallback for 'transactions' key if not found with prefix
        if (!stored && key === 'transactions') {
            const legacy = localStorage.getItem('money-counter-transactions');
            return legacy ? JSON.parse(legacy) : (key === 'initial-balances' ? { current: 0, savings: 0 } : []);
        }
        // Legacy fallback for initial-balances
        if (!stored && key === 'initial-balances') {
            const legacy = localStorage.getItem('initial-balances');
            return legacy ? JSON.parse(legacy) : { current: 0, savings: 0 };
        }
        return stored ? JSON.parse(stored) : (key === 'initial-balances' ? { current: 0, savings: 0 } : []);
    }

    return new Promise((resolve) => {
        // First check if we have chunked data
        window.Telegram.WebApp.CloudStorage.getItem(`${key}_count`, (error, countStr) => {
            if (error || !countStr) {
                // Try single key
                window.Telegram.WebApp.CloudStorage.getItem(key, (err, data) => {
                    if (err || !data) {
                        // Fallback to localStorage
                        const stored = localStorage.getItem(`money-counter-${key}`);
                        // Legacy checks again
                        if (!stored && key === 'transactions') {
                            const legacy = localStorage.getItem('money-counter-transactions');
                            resolve(legacy ? JSON.parse(legacy) : (key === 'initial-balances' ? { current: 0, savings: 0 } : []));
                        } else if (!stored && key === 'initial-balances') {
                            const legacy = localStorage.getItem('initial-balances');
                            resolve(legacy ? JSON.parse(legacy) : { current: 0, savings: 0 });
                        } else {
                            resolve(stored ? JSON.parse(stored) : (key === 'initial-balances' ? { current: 0, savings: 0 } : []));
                        }
                    } else {
                        resolve(JSON.parse(data));
                    }
                });
            } else {
                // Load chunks
                const count = parseInt(countStr, 10);
                const keys = [];
                for (let i = 0; i < count; i++) {
                    keys.push(`${key}_${i}`);
                }

                window.Telegram.WebApp.CloudStorage.getItems(keys, (err, values) => {
                    if (err) {
                        const stored = localStorage.getItem(`money-counter-${key}`);
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
