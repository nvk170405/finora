import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShippingDeliveryPage: React.FC = () => {
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
                            Shipping & Delivery Policy
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: December 2024</p>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Digital Service Delivery</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    FinoraX is a digital financial management platform. As such, there are no physical products to ship. Our service delivery works as follows:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li><strong>Instant Access:</strong> Upon successful subscription payment, you will receive immediate access to all premium features</li>
                                    <li><strong>Account Activation:</strong> Your account is automatically upgraded within seconds of payment confirmation</li>
                                    <li><strong>Confirmation Email:</strong> A confirmation email with subscription details is sent immediately after purchase</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Service Availability</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Our digital service is available:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>24 hours a day, 7 days a week</li>
                                    <li>Globally, with no geographical restrictions</li>
                                    <li>On web browsers and mobile devices</li>
                                    <li>With 99.9% uptime guarantee</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Access Requirements</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    To access FinoraX services, you need:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>A stable internet connection</li>
                                    <li>A modern web browser (Chrome, Firefox, Safari, Edge)</li>
                                    <li>A valid email address for account verification</li>
                                    <li>An active subscription for premium features</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Delivery Issues</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    If you experience any issues accessing the service after payment:
                                </p>
                                <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Try logging out and logging back in</li>
                                    <li>Clear your browser cache and cookies</li>
                                    <li>Check your email for payment confirmation</li>
                                    <li>Contact our support team at <a href="mailto:support@finorax.com" className="text-lime-accent hover:underline">support@finorax.com</a></li>
                                </ol>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Physical Cards (If Applicable)</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    For premium users who opt for a physical FinoraX card:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li><strong>Delivery Time:</strong> 7-14 business days for domestic (India)</li>
                                    <li><strong>International:</strong> 14-21 business days for international delivery</li>
                                    <li><strong>Shipping Cost:</strong> Free for Premium subscribers</li>
                                    <li><strong>Tracking:</strong> Tracking information will be sent via email once shipped</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    For any delivery-related queries, please contact us at{' '}
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
