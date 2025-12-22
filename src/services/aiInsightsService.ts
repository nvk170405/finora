/**
 * AI Insights Service using AIML API
 * Generates personalized financial insights for premium users
 */

// AIML API (OpenAI-compatible)
const AIML_API_URL = 'https://api.aimlapi.com/v1/chat/completions';

export interface FinancialData {
    totalIncome: number;
    totalExpenses: number;
    monthlyBills: number;
    savingsRate: number;
    topCategories: { name: string; amount: number }[];
    currencySymbol: string;
}

export interface AIInsight {
    title: string;
    content: string;
    type: 'tip' | 'warning' | 'success' | 'info';
}

/**
 * Generate AI-powered financial insights
 */
export async function generateFinancialInsights(data: FinancialData): Promise<AIInsight[]> {
    const apiKey = import.meta.env.VITE_AIML_API_KEY;

    if (!apiKey) {
        console.warn('[AI] No AIML API key configured, using rule-based insights');
        return generateRuleBasedInsights(data);
    }

    return generateWithAIML(data, apiKey);
}

/**
 * Generate insights using AIML API (OpenAI-compatible)
 */
async function generateWithAIML(data: FinancialData, apiKey: string): Promise<AIInsight[]> {
    const prompt = buildPrompt(data);

    console.log('[AIML] Making request...');

    try {
        const response = await fetch(AIML_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful financial advisor. Analyze the user's financial data and provide exactly 3 personalized insights.

Respond with ONLY a valid JSON array in this exact format, no other text:
[
  {"title": "Short Title", "content": "Brief advice in 1-2 sentences", "type": "success"},
  {"title": "Another Title", "content": "More advice", "type": "tip"},
  {"title": "Third Title", "content": "Final insight", "type": "info"}
]

Use these types appropriately:
- "success" for good financial habits
- "warning" for concerns or risks
- "tip" for actionable suggestions
- "info" for observations`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        console.log('[AIML] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AIML] Error:', errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('[AIML] Response:', result);

        // Extract content from OpenAI-style response
        const content = result.choices?.[0]?.message?.content || '';
        console.log('[AIML] Content:', content);

        const insights = parseInsightsFromAI(content);

        return insights.length > 0 ? insights : generateRuleBasedInsights(data);

    } catch (error) {
        console.error('[AIML] Error:', error);
        return generateRuleBasedInsights(data);
    }
}

/**
 * Build prompt from financial data
 */
function buildPrompt(data: FinancialData): string {
    const topCats = data.topCategories
        .slice(0, 5)
        .map(c => `- ${c.name}: ${data.currencySymbol}${c.amount.toLocaleString()}`)
        .join('\n');

    return `Here's my monthly financial summary:

Income: ${data.currencySymbol}${data.totalIncome.toLocaleString()}
Expenses: ${data.currencySymbol}${data.totalExpenses.toLocaleString()}
Recurring Bills: ${data.currencySymbol}${data.monthlyBills.toLocaleString()}
Savings Rate: ${data.savingsRate.toFixed(1)}%

Top Spending Categories:
${topCats || 'No categories available'}

Please analyze my finances and provide 3 personalized insights.`;
}

/**
 * Parse AI response into insights array
 */
function parseInsightsFromAI(content: string): AIInsight[] {
    try {
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter(item => item.title && item.content && item.type)
                    .slice(0, 4);
            }
        }
    } catch (e) {
        console.warn('[AIML] Failed to parse response:', e);
    }
    return [];
}

/**
 * Rule-based insights fallback
 */
function generateRuleBasedInsights(data: FinancialData): AIInsight[] {
    const insights: AIInsight[] = [];
    const { totalIncome, totalExpenses, monthlyBills, savingsRate, topCategories, currencySymbol } = data;

    // Filter expense categories
    const expenseCategories = topCategories.filter(c =>
        !['income', 'salary', 'deposit', 'revenue'].includes(c.name.toLowerCase())
    );

    // Savings analysis
    if (savingsRate >= 20) {
        insights.push({
            title: 'Great Savings Rate! 🎯',
            content: `You're saving ${savingsRate.toFixed(0)}% of your income. Keep building that financial cushion!`,
            type: 'success'
        });
    } else if (savingsRate > 0) {
        insights.push({
            title: 'Boost Your Savings',
            content: `Saving ${savingsRate.toFixed(0)}% is a start. Try the 50/30/20 rule to reach 20%.`,
            type: 'tip'
        });
    } else {
        insights.push({
            title: 'Spending Alert',
            content: 'Expenses exceed income. Review and cut non-essential spending.',
            type: 'warning'
        });
    }

    // Bills ratio
    if (totalIncome > 0 && monthlyBills > 0) {
        const billsPercent = (monthlyBills / totalIncome) * 100;
        if (billsPercent > 50) {
            insights.push({
                title: 'High Fixed Costs',
                content: `${billsPercent.toFixed(0)}% goes to recurring bills. Consider renegotiating.`,
                type: 'warning'
            });
        } else {
            insights.push({
                title: 'Bills Under Control',
                content: `Fixed costs at ${billsPercent.toFixed(0)}% of income - well managed.`,
                type: 'success'
            });
        }
    }

    // Top category
    if (expenseCategories.length > 0) {
        const top = expenseCategories[0];
        insights.push({
            title: `Top: ${top.name}`,
            content: `${top.name} is your biggest expense at ${currencySymbol}${top.amount.toLocaleString()}.`,
            type: 'info'
        });
    }

    // Expense ratio
    if (totalIncome > 0 && (totalExpenses / totalIncome) < 0.5) {
        insights.push({
            title: 'Living Below Means 💪',
            content: `Spending only ${((totalExpenses / totalIncome) * 100).toFixed(0)}% of income. Excellent discipline!`,
            type: 'success'
        });
    }

    return insights.slice(0, 4);
}
