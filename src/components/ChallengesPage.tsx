import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Target, Calendar, CheckCircle, Clock, Users,
    TrendingDown, Zap, Award, ChevronRight
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';

interface Challenge {
    id: string;
    title: string;
    description: string;
    challenge_type: string;
    target_value: number | null;
    target_percentage: number | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface UserChallenge {
    id: string;
    challenge_id: string;
    joined_at: string;
    current_progress: number;
    is_completed: boolean;
    challenge?: Challenge;
}

const challengeIcons: Record<string, typeof Trophy> = {
    reduce_spending: TrendingDown,
    avoid_category: Target,
    savings_goal: Zap,
};

export const ChallengesPage: React.FC = () => {
    const { user } = useAuth();
    const { currencySymbol } = usePreferences();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchChallenges();
            fetchUserChallenges();
        }
    }, [user]);

    const fetchChallenges = async () => {
        try {
            const { data, error } = await supabase
                .from('weekly_challenges')
                .select('*')
                .eq('is_active', true)
                .order('start_date', { ascending: false });

            if (error) throw error;
            setChallenges(data || []);
        } catch (err) {
            console.error('Error fetching challenges:', err);
        }
    };

    const fetchUserChallenges = async () => {
        try {
            const { data, error } = await supabase
                .from('user_challenges')
                .select(`
                    *,
                    challenge:weekly_challenges(*)
                `)
                .eq('user_id', user?.id);

            if (error) throw error;
            setUserChallenges(data || []);
        } catch (err) {
            console.error('Error fetching user challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    const joinChallenge = async (challengeId: string) => {
        try {
            const { error } = await supabase
                .from('user_challenges')
                .insert({
                    user_id: user?.id,
                    challenge_id: challengeId,
                    current_progress: 0,
                });

            if (error) throw error;
            fetchUserChallenges();
        } catch (err) {
            console.error('Error joining challenge:', err);
        }
    };

    const getDaysRemaining = (endDate: string): number => {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    };

    const isJoined = (challengeId: string): boolean => {
        return userChallenges.some(uc => uc.challenge_id === challengeId);
    };

    const getProgress = (challengeId: string): UserChallenge | undefined => {
        return userChallenges.find(uc => uc.challenge_id === challengeId);
    };

    const completedCount = userChallenges.filter(uc => uc.is_completed).length;
    const activeCount = userChallenges.filter(uc => !uc.is_completed).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                    Weekly Challenges
                </h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Join challenges to improve your financial habits
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lime-accent/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-lime-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Completed</p>
                            <p className="text-2xl font-bold text-lime-accent">{completedCount}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Target className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active</p>
                            <p className="text-2xl font-bold text-blue-500">{activeCount}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Award className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Available</p>
                            <p className="text-2xl font-bold text-purple-500">{challenges.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Active Challenges */}
            {challenges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        Available Challenges
                    </h3>
                    <div className="grid gap-4">
                        {challenges.map((challenge, index) => {
                            const Icon = challengeIcons[challenge.challenge_type] || Trophy;
                            const joined = isJoined(challenge.id);
                            const progress = getProgress(challenge.id);
                            const daysLeft = getDaysRemaining(challenge.end_date);

                            return (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className={`bg-light-surface dark:bg-dark-surface border rounded-xl p-6 ${joined
                                            ? 'border-lime-accent/50'
                                            : 'border-light-border dark:border-dark-border'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className={`p-3 rounded-xl ${joined ? 'bg-lime-accent/20' : 'bg-light-glass dark:bg-dark-glass'}`}>
                                                <Icon className={`w-8 h-8 ${joined ? 'text-lime-accent' : 'text-light-text-secondary dark:text-dark-text-secondary'}`} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-light-text dark:text-dark-text">
                                                    {challenge.title}
                                                </h4>
                                                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                                    {challenge.description}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-3 text-sm">
                                                    <span className="flex items-center text-light-text-secondary dark:text-dark-text-secondary">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {daysLeft} days left
                                                    </span>
                                                    {challenge.target_percentage && (
                                                        <span className="flex items-center text-light-text-secondary dark:text-dark-text-secondary">
                                                            <Target className="w-4 h-4 mr-1" />
                                                            {challenge.target_percentage}% target
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end space-y-2">
                                            {joined ? (
                                                <>
                                                    {progress?.is_completed ? (
                                                        <span className="px-4 py-2 bg-lime-accent text-gray-900 rounded-lg font-medium flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Completed!
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-medium">
                                                            In Progress
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => joinChallenge(challenge.id)}
                                                    className="px-4 py-2 bg-lime-accent text-gray-900 rounded-lg font-medium flex items-center"
                                                >
                                                    Join <ChevronRight className="w-4 h-4 ml-1" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar for joined challenges */}
                                    {joined && !progress?.is_completed && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Progress</span>
                                                <span className="font-medium text-light-text dark:text-dark-text">
                                                    {Math.round(progress?.current_progress || 0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress?.current_progress || 0}%` }}
                                                    className="h-full bg-lime-accent rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* No Challenges */}
            {challenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center"
                >
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Active Challenges</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Check back soon for new weekly challenges!
                    </p>
                </motion.div>
            )}

            {/* Challenge Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-lime-accent/20 to-green-500/20 border border-lime-accent/30 rounded-xl p-6"
            >
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-lime-accent/20 rounded-xl">
                        <Users className="w-8 h-8 text-lime-accent" />
                    </div>
                    <div>
                        <h4 className="font-bold text-light-text dark:text-dark-text mb-1">
                            🏆 Challenge Tips
                        </h4>
                        <ul className="text-light-text-secondary dark:text-dark-text-secondary space-y-1">
                            <li>• Completing challenges unlocks special achievements</li>
                            <li>• Track your no-spend days for bonus points</li>
                            <li>• New challenges are added every week</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
