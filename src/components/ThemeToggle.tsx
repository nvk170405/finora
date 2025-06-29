import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-full p-1">
      {themes.map((themeOption) => (
        <motion.button
          key={themeOption.value}
          onClick={() => setTheme(themeOption.value)}
          className={`relative p-2 rounded-full transition-colors ${
            theme === themeOption.value
              ? 'text-lime-accent'
              : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <themeOption.icon className="w-4 h-4" />
          {theme === themeOption.value && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-lime-accent/10 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};