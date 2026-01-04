import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function useAIAnalysis() {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState(null);
    const [error, setError] = useState(null);

    const generateAdvice = useCallback(async (stats, period) => {
        if (!API_KEY || API_KEY === 'your_api_key_here') {
            setError('API ключ не настроен. Добавьте VITE_GEMINI_API_KEY в .env файл.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

            const periodNames = {
                day: 'день',
                week: 'неделю',
                month: 'месяц',
            };

            const categoryBreakdown = stats.categoryBreakdown
                .map((c) => `${c.category}: ${c.amount}₽ (${c.percent.toFixed(0)}%)`)
                .join(', ');

            const prompt = `Ты — персональный финансовый помощник. Проанализируй расходы пользователя за ${periodNames[period]} и дай краткие советы.

Данные:
- Расходы: ${stats.expenses}₽
- Доходы: ${stats.income}₽
- Баланс: ${stats.balance}₽
- Изменение расходов: ${stats.expenseChange > 0 ? '+' : ''}${stats.expenseChange.toFixed(0)}% по сравнению с прошлым периодом
- Категории расходов: ${categoryBreakdown || 'нет данных'}

Ответь кратко (3-4 пункта), используй эмодзи. Формат:
📊 Краткий анализ
💡 1-2 совета по оптимизации
⚠️ Предупреждение (если есть проблема)`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAdvice(response.text());
        } catch (err) {
            console.error('AI Error:', err);
            setError('Не удалось получить анализ. Проверьте API ключ.');
        } finally {
            setLoading(false);
        }
    }, []);

    const clearAdvice = useCallback(() => {
        setAdvice(null);
        setError(null);
    }, []);

    return {
        loading,
        advice,
        error,
        generateAdvice,
        clearAdvice,
        isConfigured: API_KEY && API_KEY !== 'your_api_key_here',
    };
}
