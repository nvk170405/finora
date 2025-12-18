import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    duration = 1,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}) => {
    const spring = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: duration * 1000
    });

    const display = useTransform(spring, (latest) => {
        if (decimals > 0) {
            return `${prefix}${latest.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}${suffix}`;
        }
        return `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
    });

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span className={className}>{display}</motion.span>;
};

// Simple version for when framer-motion transform doesn't work well
export const CountingNumber: React.FC<AnimatedNumberProps> = ({
    value,
    duration = 1.5,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = ''
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const startValue = displayValue;
        const endValue = value;
        const durationMs = duration * 1000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    const formatted = decimals > 0
        ? displayValue.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
        : Math.round(displayValue).toLocaleString();

    return <span className={className}>{prefix}{formatted}{suffix}</span>;
};
