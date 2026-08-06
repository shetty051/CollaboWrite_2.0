import React from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label className="text-xs font-semibold tracking-wider uppercase text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'px-4 py-2.5 rounded-xl border border-border bg-bg/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all duration-300 w-full text-sm',
            error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 font-medium pl-1">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
