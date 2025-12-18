import { supabase } from '../config/supabase';

// Achievement definitions
export const ACHIEVEMENTS = [
    {
        id: 'first_deposit',
        name: 'First Steps',
        description: 'Made your first deposit',
        icon: '💰',
        category: 'deposits',
    },
    {
        id: 'streak_3',
        name: 'Mindful Spender',
        description: '3-day no-spend streak',
        icon: '🔥',
        category: 'streaks',
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7-day no-spend streak',
        icon: '⚔️',
        category: 'streaks',
    },
    {
        id: 'streak_14',
        name: 'Fortnight Fighter',
        description: '14-day no-spend streak',
        icon: '🛡️',
        category: 'streaks',
    },
    {
        id: 'streak_30',
        name: 'Monthly Master',
        description: '30-day no-spend streak',
        icon: '👑',
        category: 'streaks',
    },
    {
        id: 'savings_goal',
        name: 'Goal Getter',
        description: 'Completed a savings goal',
        icon: '🎯',
        category: 'goals',
    },
    {
        id: 'budget_under',
        name: 'Budget Boss',
        description: 'Stayed under budget for a month',
        icon: '📊',
        category: 'budgets',
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Made a deposit before 8 AM',
        icon: '🌅',
        category: 'special',
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Made a deposit after 10 PM',
        icon: '🦉',
        category: 'special',
    },
    {
        id: 'first_withdrawal',
        name: 'Cash Flow',
        description: 'Made your first withdrawal',
        icon: '💸',
        category: 'withdrawals',
    },
    {
        id: 'recurring_setup',
        name: 'Autopilot',
        description: 'Set up a recurring deposit',
        icon: '🔄',
        category: 'recurring',
    },
    {
        id: 'multi_currency',
        name: 'Global Citizen',
        description: 'Created wallets in 3+ currencies',
        icon: '🌍',
        category: 'wallets',
    },
];

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export interface UserAchievement {
    achievement_id: string;
    unlocked_at: string;
}

export interface SpendingStreak {
    current_streak: number;
    best_streak: number;
    last_no_spend_date: string | null;
    streak_started_at: string | null;
}

export const achievementService = {
    // Get user's unlocked achievements
    async getUserAchievements(): Promise<UserAchievement[]> {
        const { data, error } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .order('unlocked_at', { ascending: false });

        if (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
        return data || [];
    },

    // Unlock an achievement
    async unlockAchievement(achievementId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: user.id,
                achievement_id: achievementId,
            });

        if (error) {
            // Already unlocked is fine
            if (error.code === '23505') return true;
            console.error('Error unlocking achievement:', error);
            return false;
        }
        return true;
    },

    // Check if achievement is unlocked
    async isUnlocked(achievementId: string): Promise<boolean> {
        const { data } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('achievement_id', achievementId)
            .single();

        return !!data;
    },

    // Get streak data
    async getStreak(): Promise<SpendingStreak> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { current_streak: 0, best_streak: 0, last_no_spend_date: null, streak_started_at: null };
        }

        const { data, error } = await supabase
            .from('spending_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return { current_streak: 0, best_streak: 0, last_no_spend_date: null, streak_started_at: null };
        }

        return {
            current_streak: data.current_streak,
            best_streak: data.best_streak,
            last_no_spend_date: data.last_no_spend_date,
            streak_started_at: data.streak_started_at,
        };
    },

    // Log a no-spend day
    async logNoSpendDay(): Promise<SpendingStreak> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { current_streak: 0, best_streak: 0, last_no_spend_date: null, streak_started_at: null };
        }

        const today = new Date().toISOString().split('T')[0];
        const currentStreak = await this.getStreak();

        // Check if already logged today
        if (currentStreak.last_no_spend_date === today) {
            return currentStreak;
        }

        // Check if streak continues (yesterday was the last no-spend day)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        let streakStarted = today;

        if (currentStreak.last_no_spend_date === yesterdayStr) {
            // Continue streak
            newStreak = currentStreak.current_streak + 1;
            streakStarted = currentStreak.streak_started_at || today;
        }

        const newBest = Math.max(newStreak, currentStreak.best_streak);

        const { error } = await supabase
            .from('spending_streaks')
            .upsert({
                user_id: user.id,
                current_streak: newStreak,
                best_streak: newBest,
                last_no_spend_date: today,
                streak_started_at: streakStarted,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error updating streak:', error);
            return currentStreak;
        }

        // Check for streak achievements
        if (newStreak >= 3) await this.unlockAchievement('streak_3');
        if (newStreak >= 7) await this.unlockAchievement('streak_7');
        if (newStreak >= 14) await this.unlockAchievement('streak_14');
        if (newStreak >= 30) await this.unlockAchievement('streak_30');

        return {
            current_streak: newStreak,
            best_streak: newBest,
            last_no_spend_date: today,
            streak_started_at: streakStarted,
        };
    },

    // Break the streak (when user spends)
    async breakStreak(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentStreak = await this.getStreak();

        await supabase
            .from('spending_streaks')
            .upsert({
                user_id: user.id,
                current_streak: 0,
                best_streak: currentStreak.best_streak,
                last_no_spend_date: null,
                streak_started_at: null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
    },

    // Get all achievements with unlock status
    async getAllAchievementsWithStatus(): Promise<(Achievement & { unlocked: boolean; unlocked_at?: string })[]> {
        const unlocked = await this.getUserAchievements();
        const unlockedMap = new Map(unlocked.map(a => [a.achievement_id, a.unlocked_at]));

        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: unlockedMap.has(a.id),
            unlocked_at: unlockedMap.get(a.id),
        }));
    },
};
