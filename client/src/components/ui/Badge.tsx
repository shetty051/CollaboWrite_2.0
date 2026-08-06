import React from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning'
}

export const Badge = ({ className, variant = 'primary', children, ...props }: BadgeProps) => {
  const baseStyles =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border font-sans'

  const variants = {
    primary: 'bg-accent/10 border-accent/20 text-accent',
    secondary: 'bg-surface border-border text-text-muted',
    outline: 'bg-transparent border-text/20 text-text',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
