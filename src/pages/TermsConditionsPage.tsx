import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsConditionsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-base">
            <Header />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center space-x-2 text-lime-accent hover:underline mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            Terms and Conditions
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: December 2024</p>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    By accessing and using FinoraX ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    FinoraX provides a digital financial management platform that includes:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Multi-currency wallet management</li>
                                    <li>Transaction tracking and analytics</li>
                                    <li>Real-time exchange rate information</li>
                                    <li>Financial insights and reporting</li>
                                    <li>Secure money transfers</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    To use our Service, you must:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Be at least 18 years of age</li>
                                    <li>Provide accurate and complete registration information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Subscription and Payments</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Our Service offers subscription plans with the following terms:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Subscriptions are billed in advance on a monthly or yearly basis</li>
                                    <li>Prices are subject to change with 30 days notice</li>
                                    <li>All payments are processed securely through our payment partners</li>
                                    <li>Refunds are subject to our Cancellation & Refund Policy</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Prohibited Activities</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    You agree not to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Use the Service for any illegal purpose</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Transmit malware or other harmful code</li>
                                    <li>Interfere with the proper functioning of the Service</li>
                                    <li>Resell or redistribute the Service without authorization</li>
                                    <li>Use the Service for money laundering or fraud</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Intellectual Property</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    All content, features, and functionality of the Service are owned by FinoraX and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    FinoraX shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount paid by you for the Service in the twelve months preceding the claim.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Modifications to Terms</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Continued use after such modifications constitutes acceptance of the updated terms.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Governing Law</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    For questions about these Terms and Conditions, please contact us at{' '}
                                    <a href="mailto:legal@finorax.com" className="text-lime-accent hover:underline">legal@finorax.com</a>
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
