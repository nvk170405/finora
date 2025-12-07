import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactUsPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to your backend
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-dark-base">
            <Header />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <Link to="/" className="inline-flex items-center space-x-2 text-lime-accent hover:underline mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Contact Us
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Have a question or need help? We're here to assist you. Reach out to us through any of the channels below.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                            {/* Contact Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-gray-50 dark:bg-dark-glass rounded-2xl p-8 text-center"
                            >
                                <div className="w-14 h-14 bg-lime-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-lime-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">For general inquiries</p>
                                <a href="mailto:support@finorax.com" className="text-lime-accent hover:underline font-medium">
                                    support@finorax.com
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-gray-50 dark:bg-dark-glass rounded-2xl p-8 text-center"
                            >
                                <div className="w-14 h-14 bg-lime-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="w-7 h-7 text-lime-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Chat with our support team</p>
                                <span className="text-lime-accent font-medium">Available 24/7</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-gray-50 dark:bg-dark-glass rounded-2xl p-8 text-center"
                            >
                                <div className="w-14 h-14 bg-lime-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-7 h-7 text-lime-accent" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Response Time</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Average response time</p>
                                <span className="text-lime-accent font-medium">Under 2 hours</span>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>

                                {submitted ? (
                                    <div className="bg-lime-accent/10 border border-lime-accent/20 rounded-2xl p-8 text-center">
                                        <div className="w-16 h-16 bg-lime-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Send className="w-8 h-8 text-lime-accent" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Thank you for contacting us. We'll get back to you within 24 hours.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-glass border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-lime-accent focus:border-transparent outline-none text-gray-900 dark:text-white"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-glass border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-lime-accent focus:border-transparent outline-none text-gray-900 dark:text-white"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-glass border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-lime-accent focus:border-transparent outline-none text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select a topic</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="support">Technical Support</option>
                                                <option value="billing">Billing & Payments</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="partnership">Partnership</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-glass border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-lime-accent focus:border-transparent outline-none text-gray-900 dark:text-white resize-none"
                                                placeholder="How can we help you?"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-lime-accent text-gray-900 py-4 rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Send Message</span>
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                )}
                            </motion.div>

                            {/* Company Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Company Information</h2>

                                <div className="bg-gray-50 dark:bg-dark-glass rounded-2xl p-8 space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-lime-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-lime-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Registered Address</h4>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                FinoraX Technologies<br />
                                                Himachal Pradesh 173205<br />
                                                India
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-lime-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-lime-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Addresses</h4>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                General: <a href="mailto:support@finorax.com" className="text-lime-accent hover:underline">support@finorax.com</a><br />
                                                Sales: <a href="mailto:sales@finorax.com" className="text-lime-accent hover:underline">sales@finorax.com</a><br />
                                                Legal: <a href="mailto:legal@finorax.com" className="text-lime-accent hover:underline">legal@finorax.com</a>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-lime-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 text-lime-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h4>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                +91 80 1234 5678<br />
                                                Monday - Friday, 9 AM - 6 PM IST
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-lime-accent/10 border border-lime-accent/20 rounded-2xl">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Need Urgent Help?</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        For urgent account or payment issues, our priority support line is available 24/7 for Premium subscribers.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
