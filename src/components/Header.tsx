import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user } = useAuth();
 

 

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-b border-light-border dark:border-dark-border z-50 transition-colors duration-300"
    >
      <div className="fixed top-8 left-0 right-0 z-10 mx-auto max-w-3xl px-6 py-1 bg-light-base dark:bg-dark-surface dark:shadow-lime-700 dark:shadow-2xl ring-2 ring-gray-300 dark:ring-gray-700 rounded-full shadow-xl backdrop-blur-lg ">
        <div className="flex items-center justify-between h-16 ">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-lime-accent rounded-lg">
              <TrendingUp className="w-6 h-6 font-montserrat text-light-base dark:text-dark-base" />
            </div>
            <span className="text-xl font-montserrat font-bold text-lime-accent font-editorial">FinoraX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex justify-between items-center gap-10 ">
            <Link to="/" className="font-semibold text-gray-500 dark:text-gray-300 hover:text-lime-accent transition-colors">
              Home
            </Link>
            <Link to="/#features" className="font-semibold text-gray-500 dark:text-gray-300 hover:text-lime-accent transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="font-semibold text-gray-500 dark:text-gray-300 hover:text-lime-accent transition-colors">
              Pricing
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-semibold hover:shadow-glow transition-all"
                >
                  Dashboard
                </Link>
                
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                
                <Link
                  to="/signup"
                  className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium hover:shadow-glow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
            <ThemeToggle />
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-light-glass dark:hover:bg-dark-glass transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-light-text dark:text-dark-text" />
            ) : (
              <Menu className="w-6 h-6 text-light-text dark:text-dark-text" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-light-border dark:border-dark-border"
          >
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-light-text dark:text-dark-text hover:text-lime-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/#features"
                className="text-light-text dark:text-dark-text hover:text-lime-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/#pricing"
                className="text-light-text dark:text-dark-text hover:text-lime-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-light-text dark:text-dark-text hover:text-lime-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-2 rounded-lg font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
              <div className="pt-4">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};