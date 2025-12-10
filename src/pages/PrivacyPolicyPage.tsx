import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
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
                            Privacy Policy
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: December 2024</p>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">We collect the following types of information:</p>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Personal Information</h3>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <li>Name and email address</li>
                                    <li>Phone number (optional)</li>
                                    <li>Profile picture (optional)</li>
                                    <li>Payment information (processed securely by our payment partners)</li>
                                </ul>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Usage Information</h3>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Device information and browser type</li>
                                    <li>IP address and location data</li>
                                    <li>Usage patterns and feature interactions</li>
                                    <li>Transaction and wallet data you enter</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">We use collected information to:</p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Provide and maintain our Service</li>
                                    <li>Process payments and subscriptions</li>
                                    <li>Send you important updates and notifications</li>
                                    <li>Improve our Service and user experience</li>
                                    <li>Detect and prevent fraud or abuse</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">We implement robust security measures:</p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>256-bit SSL/TLS encryption for all data transmission</li>
                                    <li>Encrypted storage for sensitive data</li>
                                    <li>Regular security audits and penetration testing</li>
                                    <li>Two-factor authentication options</li>
                                    <li>Compliance with PCI-DSS for payment processing</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Sharing</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">We do not sell your personal data. We may share information with:</p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li><strong>Payment Processors:</strong> Secure third-party payment processing</li>
                                    <li><strong>Service Providers:</strong> Cloud hosting and analytics services</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cookies and Tracking</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Keep you logged in</li>
                                    <li>Remember your preferences</li>
                                    <li>Analyze usage patterns</li>
                                    <li>Improve our Service</li>
                                </ul>
                                <p className="text-gray-600 dark:text-gray-300 mt-4">
                                    You can disable cookies in your browser settings, but this may affect Service functionality.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Your Rights</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">You have the right to:</p>
                                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate data</li>
                                    <li>Delete your account and data</li>
                                    <li>Export your data</li>
                                    <li>Opt-out of marketing communications</li>
                                    <li>Withdraw consent at any time</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We retain your data for as long as your account is active or as needed to provide services. After account deletion, we retain certain data for up to 30 days for backup purposes and as required by law.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to This Policy</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    For privacy-related questions, contact our Data Protection Officer at{' '}
                                    <a href="mailto:privacy@finorax.com" className="text-lime-accent hover:underline">privacy@finorax.com</a>
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
