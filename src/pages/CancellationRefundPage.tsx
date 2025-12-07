import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CancellationRefundPage: React.FC = () => {
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
                            Cancellation & Refund Policy
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: December 2024</p>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Subscription Cancellation</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    You may cancel your FinoraX subscription at any time through your account settings or by contacting our support team. Upon cancellation:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Your subscription will remain active until the end of the current billing period</li>
                                    <li>You will not be charged for subsequent billing periods</li>
                                    <li>Access to premium features will be revoked after the billing period ends</li>
                                    <li>Your account data will be retained for 30 days after cancellation</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Refund Policy</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    We offer refunds under the following conditions:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li><strong>Within 7 days:</strong> Full refund for monthly subscriptions if requested within 7 days of purchase</li>
                                    <li><strong>Within 14 days:</strong> Full refund for yearly subscriptions if requested within 14 days of purchase</li>
                                    <li><strong>Technical issues:</strong> Pro-rated refund if service was unavailable for extended periods due to our fault</li>
                                    <li><strong>Unauthorized charges:</strong> Full refund for any unauthorized transactions</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How to Request a Refund</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    To request a refund, please:
                                </p>
                                <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Email us at <a href="mailto:support@finorax.com" className="text-lime-accent hover:underline">support@finorax.com</a></li>
                                    <li>Include your registered email address and transaction ID</li>
                                    <li>Provide a brief reason for the refund request</li>
                                    <li>Our team will process your request within 5-7 business days</li>
                                </ol>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Non-Refundable Items</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    The following are not eligible for refunds:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Subscriptions cancelled after the refund window has passed</li>
                                    <li>Partial months of service</li>
                                    <li>Add-on services or one-time purchases (unless defective)</li>
                                    <li>Accounts terminated due to policy violations</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Refund Processing</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Approved refunds will be processed to the original payment method within 5-10 business days. The actual time for the refund to reflect in your account may vary depending on your bank or payment provider.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    If you have any questions about our Cancellation & Refund Policy, please contact us at{' '}
                                    <a href="mailto:support@finorax.com" className="text-lime-accent hover:underline">support@finorax.com</a>
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
