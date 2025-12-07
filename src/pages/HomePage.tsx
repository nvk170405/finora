import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Globe,
  Shield,
  Zap,
  BarChart3,
  CreditCard,
  Star,
  ArrowRight,
  Check,
  Smartphone,
  Info
} from 'lucide-react';
import { Header } from '../components/Header';
import { BackgroundCircles } from '../components/ui/background-circles';

const features = [
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description: 'Manage over 150+ currencies with real-time exchange rates and seamless conversions.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get deep insights into your spending patterns with AI-powered financial analytics.'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is protected with enterprise-grade encryption and security protocols.'
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Send money globally in seconds with our lightning-fast transfer network.'
  },
  {
    icon: CreditCard,
    title: 'Smart Budgeting',
    description: 'AI-powered budgeting tools that adapt to your spending habits and goals.'
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Monitor your portfolio performance across multiple markets and currencies.'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Digital Nomad',
    avatar: '👩‍💻',
    content: 'FinoraX has revolutionized how I manage my finances across different countries. The multi-currency support is flawless!'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Small Business Owner',
    avatar: '👨‍💼',
    content: 'The analytics features helped me identify spending patterns I never noticed. My business is more profitable than ever.'
  },
  {
    name: 'Emily Watson',
    role: 'Freelance Designer',
    avatar: '👩‍🎨',
    content: 'Managing client payments from different countries used to be a nightmare. FinoraX made it incredibly simple.'
  }
];

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white via-lime-50 to-white dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Unified gradient overlay for smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-accent/15 via-lime-accent/5 to-lime-accent/10 dark:from-lime-accent/8 dark:via-transparent dark:to-lime-accent/5 pointer-events-none"></div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="min-h-screen overflow-hidden px-4 sm:px-6 lg:px-8 font-montserrat relative">
          {/* Background Circles Animation */}
          <BackgroundCircles variant="lime" />

          {/* Centered Hero Content */}
          <div className="min-h-screen flex items-center justify-center relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-6xl z-50 font-extrabold text-light-text dark:text-dark-text font-montserrat mb-6"
                >
                  Smart Financial Management
                  <span className="block text-lime-accent">Made Simple</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-3xl mx-auto"
                >
                  Take control of your global finances with FinoraX's intelligent platform.
                  Multi-currency support, real-time analytics, and seamless international transfers.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
                >
                  <Link
                    to="/signup"
                    className="bg-lime-accent z-20 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glow transition-all flex items-center space-x-2"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <button className="flex z-20 items-center space-x-2 text-light-text dark:text-dark-text hover:text-lime-accent transition-colors">
                    <Info className="w-5 h-5" />
                    <span>Learn More</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="font-montserrat py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-montserrat md:text-4xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
                Everything You Need to Manage Your Finances
              </h2>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
                Powerful features designed to simplify your financial life and help you make smarter decisions.
              </p>
            </motion.div>

            <div className="grid font-montserrat grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-light-surface font-montserrat dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-lime-accent/30 transition-all hover:shadow-glow"
                >
                  <div className="p-3 font-montserrat bg-lime-accent/10 rounded-lg w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-lime-accent" />
                  </div>
                  <h3 className="text-xl font-montserrat font-bold text-light-text dark:text-dark-text font-editorial mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-montserrat md:text-4xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
                Start free and upgrade as you grow. All plans include our core features.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 hover:border-lime-accent/30 transition-all"
              >
                <h3 className="text-2xl font-montserrat font-bold text-light-text dark:text-dark-text font-editorial mb-2">Basic</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Perfect for personal use</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-lime-accent">$9.99</span>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Up to 5 currencies</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Basic analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Standard support</span>
                  </li>
                </ul>

                <Link
                  to="/signup"
                  className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:border-lime-accent/30 transition-all text-center block"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border-2 border-lime-accent rounded-2xl p-8 relative"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-lime-accent text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>

                <h3 className="text-2xl font-montserrat font-bold text-light-text dark:text-dark-text font-editorial mb-2">Premium</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">For power users and businesses</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-lime-accent">$24.99</span>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Unlimited currencies</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Advanced analytics & AI insights</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Priority support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">API access</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lime-accent" />
                    <span className="text-light-text dark:text-dark-text">Custom reports</span>
                  </li>
                </ul>

                <Link
                  to="/signup"
                  className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all text-center block"
                >
                  Start Premium
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-montserrat md:text-4xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
                See what our users have to say about their experience with FinoraX.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-lime-accent fill-current" />
                    ))}
                  </div>

                  <p className="text-light-text dark:text-dark-text mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text">{testimonial.name}</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-2xl p-12"
            >
              <h2 className="text-3xl font-montserrat md:text-4xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-8">
                Join thousands of users who have already simplified their financial management with FinoraX.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/signup"
                  className="bg-lime-accent text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glow transition-all"
                >
                  Start Your Free Trial
                </Link>

                <div className="flex items-center space-x-4">
                  <Smartphone className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Available on all platforms</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-lime-accent/20 dark:border-dark-border py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="p-2 bg-lime-accent rounded-lg">
                  <TrendingUp className="w-6 h-6 text-gray-900" />
                </div>
                <span className="text-xl font-bold text-lime-accent font-editorial">FinoraX</span>
              </div>

              <div className="flex items-center space-x-8">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  © 2024 FinoraX. All rights reserved.
                </span>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-lime-accent transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-lime-accent transition-colors">
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};