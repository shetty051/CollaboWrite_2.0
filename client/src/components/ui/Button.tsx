import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, onAnimationStart: _onAnimationStart, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all border disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-accent text-white border-transparent hover:bg-accent-hover shadow-sm',
      secondary: 'bg-surface text-text border-border hover:bg-surface-hover shadow-xs',
      outline: 'bg-transparent text-text border-text/20 hover:bg-text/5',
      text: 'bg-transparent text-text border-transparent hover:bg-text/5',
    }

    const sizes = {
      sm: 'px-4 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3 text-base',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
