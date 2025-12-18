import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Shield,
    Zap,
    Globe,
    CreditCard,
    TrendingUp,
    BarChart3,
    Lock,
    Smartphone,
    ArrowRight,
    Check,
    Star,
    Users,
    Clock,
    Wallet,
    PiggyBank,
    LineChart
} from 'lucide-react';
import { Header } from '../components/Header';

const heroFeatures = [
    { icon: Shield, label: 'Bank-Level Security' },
    { icon: Zap, label: 'Gamified Savings' },
    { icon: Globe, label: 'Global Coverage' },
    { icon: BarChart3, label: 'Smart Analytics' },
];

const bankingFeatures = [
    {
        icon: Wallet,
        title: 'Multi-Currency Wallets',
        description: 'Track your money across 150+ currencies with real-time portfolio value in your preferred currency.'
    },
    {
        icon: Globe,
        title: 'Global Finance Tracking',
        description: 'Perfect for digital nomads and freelancers managing income from around the world.'
    },
    {
        icon: TrendingUp,
        title: 'No-Spend Streaks',
        description: 'Build healthy financial habits with streak tracking and milestone achievements.'
    },
    {
        icon: Lock,
        title: 'Advanced Security',
        description: 'Bank-level encryption and secure authentication keep your financial data safe.'
    },
    {
        icon: BarChart3,
        title: 'Spending Insights',
        description: 'AI-powered analytics that help you understand and optimize your spending habits.'
    },
    {
        icon: PiggyBank,
        title: 'Savings Goals',
        description: 'Set and track progress toward your financial goals with visual progress indicators.'
    },
];

const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '$32.4B+', label: 'Transactions Processed' },
    { value: '99.9%', label: 'Uptime Guarantee' },
];

const benefits = [
    'Zero hidden fees on international transfers',
    'Real-time notifications for every transaction',
    'Dedicated 24/7 customer support',
    'Seamless integration with accounting tools',
    'Automatic expense categorization',
    'Customizable spending limits and budgets',
];

const testimonials = [
    {
        name: 'Sarah Chen',
        role: 'Digital Nomad',
        content: 'FinoraX has completely transformed how I manage money across different countries. The multi-currency feature is a game-changer!',
        rating: 5,
    },
    {
        name: 'Marcus Rodriguez',
        role: 'Small Business Owner',
        content: 'The business analytics saved me hours of accounting work. I can see exactly where my money goes in real-time.',
        rating: 5,
    },
    {
        name: 'Emily Watson',
        role: 'Freelance Designer',
        content: 'Finally, a banking app that understands freelancers. Invoicing, multi-currency, and instant transfers all in one place.',
        rating: 5,
    },
];

export const FeaturesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-base">
            <Header />

            {/* Hero Section */}
            <section className="pt-44 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-dark-base dark:to-dark-surface">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-2 bg-lime-accent/10 text-lime-600 dark:text-lime-accent rounded-full text-sm font-medium mb-6">
                            Powerful Features
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Powerful Features for a
                            <span className="block text-lime-accent">Smarter Banking Experience</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
                            Experience the future of personal finance with cutting-edge tools designed to simplify your money management.
                        </p>
                    </motion.div>

                    {/* Feature Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-4 mb-16"
                    >
                        {heroFeatures.map((feature, index) => (
                            <div
                                key={feature.label}
                                className="flex items-center space-x-2 px-5 py-3 bg-white dark:bg-dark-glass border border-gray-200 dark:border-dark-border rounded-full shadow-sm"
                            >
                                <feature.icon className="w-5 h-5 text-lime-accent" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{feature.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Banking at Your Fingertips Section */}
            <section className="py-36 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Banking at
                            <span className="block">Your Fingertips</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                            Everything you need to manage your money, all in one beautifully designed app.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {bankingFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-6 bg-gray-50 dark:bg-dark-glass rounded-2xl hover:bg-lime-accent/5 dark:hover:bg-lime-accent/10 transition-all border border-transparent hover:border-lime-accent/20"
                            >
                                <div className="w-12 h-12 bg-lime-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lime-accent/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-lime-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with Gradient Card */}
            <section className="py-36 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-10 md:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                                    At FinoraX, we believe banking should be effortless, secure, and accessible to everyone.
                                    Our platform combines cutting-edge technology with intuitive design to deliver a seamless
                                    digital banking solution that moves at the speed of modern life.
                                </p>
                                <div className="grid grid-cols-3 gap-8">
                                    {stats.map((stat) => (
                                        <div key={stat.label}>
                                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                            <div className="text-white/70 text-sm">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <LineChart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">Portfolio Growth</div>
                                            <div className="text-white/70 text-sm">Last 12 months</div>
                                        </div>
                                    </div>
                                    <div className="h-32 flex items-end space-x-2">
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 95, 75, 88, 100].map((height, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-white/30 rounded-t-sm"
                                                style={{ height: `${height}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* More Benefits Section */}
            <section className="py-36 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                More Benefits,
                                <span className="block text-lime-accent">Less Hassle</span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                                We've eliminated the pain points of traditional banking so you can focus on what matters most.
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={benefit}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center space-x-3"
                                    >
                                        <div className="w-6 h-6 bg-lime-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-lime-accent" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-gray-900 dark:bg-dark-glass rounded-3xl p-8 text-white">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Total Balance</div>
                                        <div className="text-3xl font-bold">$24,562.00</div>
                                    </div>
                                    <div className="w-12 h-12 bg-lime-accent rounded-xl flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-gray-900" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Card Payment</div>
                                                <div className="text-gray-400 text-sm">Apple Store</div>
                                            </div>
                                        </div>
                                        <div className="text-red-400">-$299.00</div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Salary Deposit</div>
                                                <div className="text-gray-400 text-sm">Company Inc.</div>
                                            </div>
                                        </div>
                                        <div className="text-green-400">+$4,500.00</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Peace of Mind Section */}
            <section className="py-36 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-base">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-dark-glass rounded-2xl p-6 shadow-lg">
                                    <Shield className="w-8 h-8 text-lime-accent mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">256-bit Encryption</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Bank-grade security for all transactions</p>
                                </div>
                                <div className="bg-white dark:bg-dark-glass rounded-2xl p-6 shadow-lg mt-8">
                                    <Lock className="w-8 h-8 text-lime-accent mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Biometric Auth</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Face ID & fingerprint protection</p>
                                </div>
                                <div className="bg-white dark:bg-dark-glass rounded-2xl p-6 shadow-lg">
                                    <Clock className="w-8 h-8 text-lime-accent mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">24/7 Monitoring</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Real-time fraud detection</p>
                                </div>
                                <div className="bg-white dark:bg-dark-glass rounded-2xl p-6 shadow-lg mt-8">
                                    <Users className="w-8 h-8 text-lime-accent mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Dedicated Support</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Expert help when you need it</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Peace of Mind When
                                <span className="block">Money's on Your Mind</span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                                Your security is our top priority. We use the same technology that protects the world's largest banks to keep your money safe.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center space-x-2 bg-lime-accent text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-glow transition-all"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-36 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            See What Our Customers Say About
                            <span className="block">Their Seamless Banking Experience</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 dark:bg-dark-glass rounded-2xl p-6"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-lime-accent/20 rounded-full flex items-center justify-center">
                                        <span className="text-lime-accent font-bold">{testimonial.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
                <div className="max-w-7xl mx-auto text-center">
                    <Link to="/" className="text-6xl font-bold tracking-tight text-lime-accent mb-8 font-montserrat block">
                        finoraX
                    </Link>
                    <p className="text-gray-400 mb-8">
                        The future of personal finance is here.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 mb-4">
                        <Link to="/privacy" className="hover:text-lime-accent transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-lime-accent transition-colors">Terms</Link>
                        <Link to="/cancellation-refund" className="hover:text-lime-accent transition-colors">Refunds</Link>
                        <Link to="/shipping" className="hover:text-lime-accent transition-colors">Shipping</Link>
                        <Link to="/contact" className="hover:text-lime-accent transition-colors">Contact</Link>
                    </div>
                    <div className="mt-8 text-gray-600 text-sm">
                        © 2024 FinoraX. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};
