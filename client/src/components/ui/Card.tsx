import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, onAnimationStart: _onAnimationStart, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverEffect ? { y: -4, boxShadow: '0 10px 30px var(--shadow-color)' } : undefined
        }
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={cn(
          'bg-surface border border-border rounded-2xl p-6 shadow-[0_4px_20px_var(--shadow-color)] transition-colors duration-300',
          className,
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  },
)

Card.displayName = 'Card'
